const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// Simple dev mode detection for dev indicator only
const isDev = process.env.NODE_ENV === 'development';

console.log('=== APP STARTUP ===');
console.log('Mode:', isDev ? '🔧 DEVELOPMENT' : '🚀 PRODUCTION');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Command line args:', process.argv.slice(2));
console.log('==================');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../build/icon.png'),
    frame: false, // Remove default frame for custom title bar
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      enableRemoteModule: false, // Security best practice
      preload: path.join(__dirname, '../dist/preload.js'),
      webSecurity: !isDev // Disable web security in development for hot reload
    },
    show: false, // Don't show until ready-to-show
    backgroundColor: '#ffffff' // Prevent flash of white
  });

  // Load the app
  if (isDev) {
    // In development, load from webpack dev server
    console.log('🔧 Loading from webpack dev server: http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    
    // Handle load errors in development
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ Failed to load dev server:', errorCode, errorDescription, validatedURL);
      console.log('🔄 Retrying in 2 seconds...');
      setTimeout(() => {
        console.log('🔄 Retrying to load dev server...');
        mainWindow.loadURL('http://localhost:3000');
      }, 2000);
    });
  } else {
    // In production, load the built React app
    console.log('🚀 Loading from built files');
    mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Window ready to show');
    mainWindow.show();
  });

  // Add debugging for page loading
  mainWindow.webContents.on('dom-ready', () => {
    console.log('✅ DOM ready');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading');
  });

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Started loading page');
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
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  console.log('=== MENU SETUP ===');
  console.log('isDev:', isDev);
  console.log('Platform:', process.platform);
  
  // Always hide menu for clean, modern app experience
  console.log('🎨 Setting up frameless app - no menu bar');
  Menu.setApplicationMenu(null);
  console.log('✅ Menu removed for clean interface');
  console.log('===============');

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

ipcMain.handle('is-dev-mode', () => {
  return isDev;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// Window control handlers for custom title bar
ipcMain.on('window-control', (event, action) => {
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

// Get window state for maximize button
ipcMain.handle('is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationURL);
  });
});