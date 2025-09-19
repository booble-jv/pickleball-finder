import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = !app.isPackaged;

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../build/icon.png'),
    frame: false, // Remove default frame for custom title bar
    titleBarStyle: 'hidden', // Hide title bar but keep traffic lights on macOS
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready-to-show
    backgroundColor: '#ffffff' // Prevent flash of white
  });

  // Load the app
  // In compiled code __dirname points to dist/. The built renderer assets live in dist/renderer.
  // Previous path used ../renderer which pointed outside dist and failed to find index.html.
  const rendererIndexPath = path.join(__dirname, 'renderer', 'index.html');
  const fileExists = fs.existsSync(rendererIndexPath);
  if (!fileExists) {
    console.error('Renderer index.html not found at expected path:', rendererIndexPath);
  } else {
    console.log('Resolved renderer index.html path:', rendererIndexPath);
  }
  const fileUrl = `file://${rendererIndexPath.replace(/\\/g, '/')}`;
  const forceFile = process.env.ELECTRON_FORCE_FILE === '1';
  const startUrl = (isDev && !forceFile) ? 'http://localhost:3000' : fileUrl;
  console.log('Loading URL:', startUrl, 'isDev:', isDev, 'forceFile:', forceFile);

  mainWindow.loadURL(startUrl);

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    if (errorDescription.includes('ERR_CONNECTION_REFUSED')) {
      if (isDev) {
        console.log('Dev server not available, falling back to local file...');
        mainWindow?.loadURL(fileUrl);
      }
    } else if (isDev) {
      setTimeout(() => {
        console.log('Retrying to load dev server...');
        mainWindow?.loadURL('http://localhost:3000');
      }, 1500);
    }
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Register global shortcuts for development
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (!mainWindow) return;
      
      // Ctrl+Shift+I or F12 for DevTools
      if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
        mainWindow.webContents.toggleDevTools();
      }
      // Ctrl+R or F5 for reload
      if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
        mainWindow.webContents.reload();
      }
    });

    // Capture renderer console messages into a log file for debugging white screen
    const logFile = path.join(app.getPath('userData'), 'renderer.log');
    const appendLog = (line: string) => {
      try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${line}\n`); } catch {}
    };
    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      appendLog(`console[level=${level}] ${message} (${sourceId}:${line ?? ''})`);
    });
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      appendLog(`render-process-gone: ${JSON.stringify(details)}`);
    });
    mainWindow.webContents.on('unresponsive', () => appendLog('Renderer became unresponsive'));
    mainWindow.webContents.on('did-finish-load', () => appendLog('did-finish-load fired'));
  }
}

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Pickleball Finder',
      submenu: [
        {
          label: 'About Pickleball Finder',
          click: () => {
            if (!mainWindow) return;
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Pickleball Finder',
              message: 'Pickleball Finder',
              detail: `Find and connect with pickleball players and courts in your area.\nVersion ${app.getVersion()}`
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  // Only show menu in development
  if (isDev) {
    createMenu();
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Provide dev mode flag for renderer (matches preload API expectation)
ipcMain.handle('is-dev-mode', () => {
  return isDev;
});

ipcMain.handle('show-message-box', async (event, options: Electron.MessageBoxOptions) => {
  if (!mainWindow) return;
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// Window control handlers
ipcMain.on('window-control', (event, action: 'minimize' | 'maximize' | 'close') => {
  if (!mainWindow) return;
  
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});