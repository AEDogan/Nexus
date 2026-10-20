const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (appConfig) => ipcRenderer.invoke('launch-app', appConfig),
  getFileIcon: (targetPath) => ipcRenderer.invoke('get-file-icon', targetPath),
  getFileInfo: (targetPath) => ipcRenderer.invoke('get-file-info', targetPath),
  getPathForFile: (file) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch {
      // fallback
    }
    return file?.path || '';
  },
  scanShortcuts: () => ipcRenderer.invoke('scan-shortcuts'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  setLayoutMode: (mode) => ipcRenderer.invoke('set-layout-mode', mode),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enable) => ipcRenderer.invoke('set-auto-start', enable),
  setSkipTaskbar: (flag) => ipcRenderer.invoke('set-skip-taskbar', flag),
  toggleWindow: () => ipcRenderer.invoke('toggle-window'),
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  getWallpaperLuminance: () => ipcRenderer.invoke('get-wallpaper-luminance'),
  onWallpaperLuminanceChanged: (callback) => {
    const listener = (_event, val) => callback(val);
    ipcRenderer.on('wallpaper-luminance-changed', listener);
    return () => ipcRenderer.removeListener('wallpaper-luminance-changed', listener);
  }
});
