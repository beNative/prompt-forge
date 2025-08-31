import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// FIX: Declare Node.js globals to resolve TypeScript errors for `require` and `__dirname`.
declare const require: (module: string) => any;
declare const __dirname: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = !app.isPackaged;

// The directory for storing user data.
const getDataPath = (filename: string) => {
  if (isDev) {
    // In development, store data in the project root for easy access.
    return path.join(app.getAppPath(), filename);
  }
  // For the packaged app, use the standard user data directory to avoid permission issues.
  return path.join(app.getPath('userData'), filename);
};


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  // --- IPC Handlers for Storage ---
  ipcMain.handle('storage:save', async (_, key: string, value: string) => {
    try {
      const filePath = getDataPath(`${key}.json`);
      // Ensure the directory exists before writing. This is crucial for the first run in a packaged app.
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  ipcMain.handle('storage:load', async (_, key: string) => {
     try {
      const filePath = getDataPath(`${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return { success: true, data };
    } catch (error) {
      // FIX: Use a type assertion to check for the error code, as NodeJS namespace is unavailable.
      if ((error as { code: string }).code === 'ENOENT') {
          return { success: true, data: null };
      }
      console.error(`Failed to load data for key ${key}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('storage:saveLog', async (_, defaultFilename: string, content: string) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No focused window' };

    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Save Log File',
      defaultPath: path.join(app.getPath('downloads'), defaultFilename),
      filters: [{ name: 'Log Files', extensions: ['log'] }, { name: 'All Files', extensions: ['*'] }]
    });

    if (canceled || !filePath) {
      return { success: false, error: 'Save dialog was canceled.' };
    }

    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
       console.error(`Failed to save log file to ${filePath}:`, error);
       return { success: false, error: (error as Error).message };
    }
  });
  
  // IPC Handler for reading markdown files
  ipcMain.handle('docs:read', async (_, filename: string) => {
    try {
      // FIX: Use type assertion for Electron-specific `process.resourcesPath`.
      // In a packaged app, files from extraResources are in the resources directory.
      const filePath = isDev ? path.join(app.getAppPath(), filename) : path.join((process as any).resourcesPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
       console.error(`Failed to read doc file ${filename}:`, error);
       return { success: false, error: (error as Error).message };
    }
  });


  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // FIX: Use type assertion for `process.platform`.
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});