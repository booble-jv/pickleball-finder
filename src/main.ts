import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';

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
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../renderer/index.html')}`;
  console.log('Loading URL:', startUrl, 'isDev:', isDev);
  
  mainWindow.loadURL(startUrl);

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    if (isDev) {
      // If dev server failed, try to reload after a delay
      setTimeout(() => {
        console.log('Retrying to load dev server...');
        mainWindow?.loadURL('http://localhost:3000');
      }, 2000);
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
              detail: 'Find and connect with pickleball players and courts in your area.\nVersion 1.0.0'
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