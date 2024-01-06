const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveAndRun: ([path, content]) => ipcRenderer.invoke('save-and-run', [path, content]),
});