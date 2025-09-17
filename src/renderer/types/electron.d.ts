export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  isDevMode: () => Promise<boolean>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  onMenuAction: (callback: (action: string, data?: any) => void) => void;
  removeAllListeners: (channel: string) => void;
  windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
  isMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}