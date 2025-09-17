import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  isDevMode: () => Promise<boolean>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  onMenuAction: (callback: (action: string, data?: any) => void) => void;
  removeAllListeners: (channel: string) => void;
  windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
  isMaximized: () => Promise<boolean>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  isDevMode: () => ipcRenderer.invoke('is-dev-mode'),
  showMessageBox: (options: Electron.MessageBoxOptions) => 
    ipcRenderer.invoke('show-message-box', options),
  onMenuAction: (callback: (action: string, data?: any) => void) => {
    ipcRenderer.on('menu-new-file', () => callback('new-file'));
    ipcRenderer.on('menu-open-file', (event, filePath) => callback('open-file', filePath));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  windowControl: (action: 'minimize' | 'maximize' | 'close') => {
    ipcRenderer.send('window-control', action);
  },
  isMaximized: () => ipcRenderer.invoke('is-maximized')
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts file)
  window.electronAPI = electronAPI;
}