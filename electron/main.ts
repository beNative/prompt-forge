
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { autoUpdater } from 'electron-updater';
import type { AppIcon } from '../types';

let mainWindow: BrowserWindow | null;

const iconMap: Record<AppIcon, string> = {
  default: 'icon.png',
  sparkles: 'icon-sparkles.png',
  command: 'icon-command.png',
  gear: 'icon-gear.png',
  folder: 'icon-folder.png',
};

function getIconPath(iconName: AppIcon = 'default') {
    const filename = iconMap[iconName] || iconMap.default;
    // In development, assets are relative to the project root. In production, they are in the resources path.
    const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    return path.join(basePath, 'assets', filename);
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(),
    show: false,
    title: 'PromptForge',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  } else {
    // In dev, load from the dev server esbuild is running
    mainWindow.loadURL('http://localhost:8000'); // Ensure this matches esbuild dev server port
    mainWindow.webContents.openDevTools();
  }
  
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Auto-updater setup
  autoUpdater.autoDownload = true;
  
  mainWindow.once('show', () => {
     autoUpdater.checkForUpdates();
  });
  
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater-update-available', info.version);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater-update-downloaded', info.version);
  });
  
  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater-error', err.message);
  });

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater-checking');
  });
};

app.on('ready', () => {
    createWindow();

    ipcMain.handle('read-doc', async (_event, filename: string) => {
        try {
            const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
            const docPath = path.join(basePath, 'docs', filename);
            const content = await fs.readFile(docPath, 'utf-8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('save-log', async (_event, content: string) => {
        if (!mainWindow) return { success: false, error: 'Main window not available' };
        
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Save Log File',
            defaultPath: `promptforge-log-${new Date().toISOString().slice(0, 10)}.log`,
            filters: [{ name: 'Log Files', extensions: ['log', 'txt'] }]
        });
        
        if (canceled || !filePath) return { success: true };

        try {
            await fs.writeFile(filePath, content, 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
    
    ipcMain.on('updater-set-allow-prerelease', (_event, allow: boolean) => {
        autoUpdater.allowPrerelease = allow;
    });

    ipcMain.on('updater-install-update', () => {
        autoUpdater.quitAndInstall();
    });

    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    ipcMain.on('set-app-icon', (_event, iconName: AppIcon) => {
        if (mainWindow && iconMap[iconName]) {
            mainWindow.setIcon(getIconPath(iconName));
        }
    });

    ipcMain.on('open-external-link', (_event, url: string) => {
        shell.openExternal(url);
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
