const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
    selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
    saveAndRun: ([path, content]) => ipcRenderer.invoke('save-and-run', [path, content]),
});