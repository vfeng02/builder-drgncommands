const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const url =require('url');
const fs = require('fs');
// const isDev = require("electron-is-dev");
const nodeChildProcess = require('child_process');

let mainWindow;

// if (require('electron-squirrel-startup')) app.quit();

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({});
    if (!canceled) {
        return filePaths[0];
    }
}

async function handleSaveAndRun(event, args) {
  const path = args[0];
  const content = args[1];
  fs.writeFile(path, content, err => {
    if (err) {
        console.error(err);
    }
  // file written successfully
  });

  let script = nodeChildProcess.spawn('python', [path]);

  let output = "";
  let error = "";
  let exitCode = "";

  console.log('PID: ' + script.pid);

  script.stdout.on('data', (data) => {
    console.log('stdout: ' + data);
    output = data;
  });

  script.stderr.on('data', (err) => {
    error = err;
  });

  script.on('exit', (code) => {
    exitCode = code;
  });

  return ('stdout: ' + output + '\n' + 'error: ' + error + '\n' + 'Exit Code: ' + exitCode);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      webSecurity: false // for other ways to access local filesystem, https://github.com/electron/electron/issues/23393#issuecomment-623694579
    }
  });

  // Vite dev server URL
  // console.log(isDev)

  // mainWindow.loadURL(isDev ? 'http://localhost:5173/' : url.format({
  //   pathname: path.join(__dirname, '../renderer/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }));

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }
  
  mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen);
    ipcMain.handle('save-and-run', handleSaveAndRun);
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow == null) {
    createWindow();
  }
});