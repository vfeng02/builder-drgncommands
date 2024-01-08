"use strict";
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const url = require("url");
const fs = require("fs");
const nodeChildProcess = require("child_process");
const isDev = process.env.APP_DEV ? process.env.APP_DEV.trim() == "true" : false;
let mainWindow;
async function handleFileSelect() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}
async function handleDirSelect() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (!canceled) {
    return filePaths[0];
  }
}
async function handleSaveAndRun(event, args) {
  const path2 = args[0];
  const content = args[1];
  console.log("path received: " + path2);
  console.log("content received: " + content);
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
    console.log("error: " + code);
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
  mainWindow.loadURL(isDev ? "http://localhost:5173/" : url.format({
    pathname: path.join(__dirname, "../renderer/index.html"),
    protocol: "file:",
    slashes: true
  }));
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => mainWindow = null);
}
app.whenReady().then(() => {
  ipcMain.handle("dialog:selectFile", handleFileSelect);
  ipcMain.handle("dialog:selectDir", handleDirSelect);
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
