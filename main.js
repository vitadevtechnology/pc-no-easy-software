const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

let mainWindow;


// Logger para autoUpdater
log.transports.file.level = "info";
autoUpdater.logger = log;

// Verificar se há outra instância do aplicativo
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Quando a segunda instância é aberta, foca na janela principal
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on("ready", () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}

function createWindow() {
  // Cria a janela principal
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 900,
    icon: path.join(__dirname, "assets", "logo-icon.png"), // Caminho para o ícone
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  // Emitir evento de fechamento da janela principal
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Agendar desligamento
ipcMain.on("schedule-shutdown", (event, timeInSeconds) => {
  console.log(`Desligamento programado em ${timeInSeconds} segundos`);
  exec(`shutdown -s -t ${timeInSeconds}`);
});

// Cancelar desligamento
ipcMain.on("cancel-shutdown", () => {
  console.log("Desligamento cancelado");
  exec("shutdown -a");
});

// Retorna a versão do aplicativo
ipcMain.handle("get-app-version", () => {
  return app.getVersion(); // Retorna a versão definida no package.json
});

// AutoUpdater Eventos
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Atualização disponível",
    message: "Uma nova versão está disponível. Baixando agora...",
  });
});

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Reiniciar", "Mais tarde"],
    title: "Atualização baixada",
    message: releaseName,
    detail: "Uma nova versão foi baixada. Reinicie o aplicativo para aplicar as atualizações.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
