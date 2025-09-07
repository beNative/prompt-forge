import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { autoUpdater } from 'electron-updater';

// FIX: Declare Node.js global to resolve TypeScript error for `__dirname`.
declare const __dirname: string;

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

// The directory for storing user data.
const getDataPath = (filename: string) => {
  // Standard: Store data in the OS-specific user data directory.
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, filename);
};

const getIconPath = (iconName?: string): string => {
    // We assume .png files are available for runtime changes on all platforms.
    // For the packaged app's initial icon, electron-builder uses platform-specific formats.
    const name = iconName || 'default';
    const filename = `icon-${name}.png`;
    const iconPath = isDev 
        ? path.join(app.getAppPath(), 'assets', 'icons', filename) 
        : path.join((process as any).resourcesPath, 'assets', 'icons', filename);
    return iconPath;
};


const createWindow = (initialSettings: { appIcon?: string }) => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: getIconPath(initialSettings.appIcon),
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

// Listener to change the app icon dynamically
ipcMain.on('app:set-icon', (_, iconName: string) => {
    if (mainWindow) {
        const iconPath = getIconPath(iconName);
        console.log(`Setting app icon to: ${iconPath}`);
        mainWindow.setIcon(iconPath);
    }
});

// Listener for renderer to trigger the update installation
ipcMain.on('updater:quit-and-install', () => {
  console.log('Renderer requested app restart to install update.');
  autoUpdater.quitAndInstall();
});


app.whenReady().then(async () => {
  // Read settings on startup to configure updater and initial icon
  let initialSettings: { allowPrerelease?: boolean; appIcon?: string } = {};
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


  createWindow(initialSettings);

  // Check for updates after the window has been created
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(initialSettings);
    }
  });
});

app.on('window-all-closed', () => {
  // FIX: Use type assertion for `process.platform`.
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});
