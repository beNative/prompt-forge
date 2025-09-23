import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { autoUpdater } from 'electron-updater';

declare const __dirname: string;

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

// The directory for storing user data.
const getDataPath = (filename: string) => {
  // Standard: Store data in the OS-specific user data directory.
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, filename);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    frame: false, // Create a frameless window
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Listen for window state changes and notify the renderer
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: true });
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: false });
  });


  mainWindow.loadFile(path.join(__dirname, '../index.html'));
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Configure auto-updater logging
autoUpdater.logger = console;
autoUpdater.on('update-available', () => {
  console.log('Update available.');
});
autoUpdater.on('update-downloaded', (info) => {
  console.log(`Update downloaded: ${info.version}. Notifying renderer.`);
  if (mainWindow) {
    mainWindow.webContents.send('update:downloaded', info.version);
  }
});
autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater. ' + err);
});

// Listener for renderer to change the setting dynamically
ipcMain.on('updater:set-allow-prerelease', (_, allow: boolean) => {
    console.log(`Setting allowPrerelease to: ${allow}`);
    autoUpdater.allowPrerelease = allow;
});

// Listener for renderer to trigger the update installation
ipcMain.on('updater:quit-and-install', () => {
  console.log('Renderer requested app restart to install update.');
  autoUpdater.quitAndInstall();
});

// --- IPC Handlers for Custom Window Controls ---
ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
});
ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});
ipcMain.on('window:close', () => {
    mainWindow?.close();
});


app.whenReady().then(async () => {
  // Read settings on startup to configure updater
  let initialSettings: { allowPrerelease?: boolean } = {};
  try {
    const settingsPath = getDataPath('promptforge_settings.json');
    const settingsData = await fs.readFile(settingsPath, 'utf-8');
    initialSettings = JSON.parse(settingsData);
  } catch (error) {
    console.log('Could not read settings for initial config, using defaults.');
  }

  if (typeof initialSettings.allowPrerelease === 'boolean') {
      console.log(`Initial updater allowPrerelease set to: ${initialSettings.allowPrerelease}`);
      autoUpdater.allowPrerelease = initialSettings.allowPrerelease;
  } else {
      autoUpdater.allowPrerelease = false;
  }
  
  // --- IPC Handler for App Version ---
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

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
      // In a packaged app, files from extraResources are in the resources directory.
      const filePath = isDev ? path.join(app.getAppPath(), filename) : path.join((process as any).resourcesPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
       console.error(`Failed to read doc file ${filename}:`, error);
       return { success: false, error: (error as Error).message };
    }
  });

  // IPC Handler for appending to a log file
  ipcMain.handle('storage:appendLog', async (_, content: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `promptforge-${date}.log`;
      const filePath = getDataPath(filename);
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      // Append content to the file, creating it if it doesn't exist
      await fs.appendFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to append to log file:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('settings:export', async (_, content: string) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No focused window' };

    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Settings',
      defaultPath: path.join(app.getPath('downloads'), 'promptforge_settings.json'),
      filters: [{ name: 'JSON Files', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
    });

    if (canceled || !filePath) {
      return { success: false, error: 'Export dialog was canceled.' };
    }

    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
       console.error(`Failed to export settings to ${filePath}:`, error);
       return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('settings:import', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No focused window' };

    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Import Settings',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, error: 'Import dialog was canceled.' };
    }

    try {
      const content = await fs.readFile(filePaths[0], 'utf-8');
      return { success: true, content };
    } catch (error) {
      console.error(`Failed to import settings from ${filePaths[0]}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });


  createWindow();

  // Check for updates after the window has been created
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // FIX: Cast `process` to `any` to access the 'platform' property.
  // This is necessary because the TypeScript type definition for `process` in this context is incomplete.
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});