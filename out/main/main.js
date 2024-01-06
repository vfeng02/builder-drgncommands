"use strict";
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const url = require("url");
const fs = require("fs");
const nodeChildProcess = require("child_process");
let mainWindow;
async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}
async function handleSaveAndRun(event, args) {
  const path2 = args[0];
  const content = args[1];
  fs.writeFile(path2, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
  let script = nodeChildProcess.spawn("python", [path2]);
  let output = "";
  let error = "";
  let exitCode = "";
  console.log("PID: " + script.pid);
  script.stdout.on("data", (data) => {
    console.log("stdout: " + data);
    output = data;
  });
  script.stderr.on("data", (err) => {
    error = err;
  });
  script.on("exit", (code) => {
    exitCode = code;
  });
  return "stdout: " + output + "\nerror: " + error + "\nExit Code: " + exitCode;
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 1e3,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      webSecurity: false
      // for other ways to access local filesystem, https://github.com/electron/electron/issues/23393#issuecomment-623694579
    }
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "../renderer/index.html"),
    protocol: "file:",
    slashes: true
  }));
  mainWindow.on("closed", () => mainWindow = null);
}
app.whenReady().then(() => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("save-and-run", handleSaveAndRun);
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow == null) {
    createWindow();
  }
});
