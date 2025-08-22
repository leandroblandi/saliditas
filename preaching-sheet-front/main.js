const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fetch = require("node-fetch"); // asegurate de instalarlo: npm install node-fetch

let splashWin;
let appWin;
let backendProcess;

const isDev = !app.isPackaged;

// Ruta al backend empaquetado o en dev
const backendPath = isDev
  ? path.join(__dirname, "backend", "ps-api.exe")
  : path.join(process.resourcesPath, "backend", "ps-api.exe");

// Endpoint de health check del backend
const BACKEND_HEALTH_URL = "http://localhost:8082/psa/api/status";

// ---------------- Splash ----------------
function createSplash() {
  splashWin = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    title: "Saliditas App",
    icon: path.join(__dirname, "/public/icon.png"),
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  splashWin.loadFile(path.join(__dirname, "splash", "splash.html"));
}

// ---------------- Ventana Principal ----------------
function createMainWindow() {
  appWin = new BrowserWindow({
    width: 1000,
    height: 800,
    title: "Saliditas App",
    icon: path.join(__dirname, "/public/icon.png"),
    resizable: true,
    titleBarStyle: "default",
    titleBarOverlay: {
      color: "#ffffff",
      symbolColor: "#000000",
      height: 32
    },
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  appWin.loadURL(`file://${__dirname}/dist/preaching-sheet-front/index.html`);
  appWin.setMenu(null);
  appWin.maximize();
  appWin.webContents.openDevTools();

  if (splashWin) {
    splashWin.close();
    splashWin = null;
  }

  appWin.on("closed", () => {
    appWin = null;
    if (backendProcess) backendProcess.kill();
  });
}

// ---------------- Backend Process ----------------
function startBackend() {
  backendProcess = spawn(backendPath, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  backendProcess.unref();
}

// ---------------- Health Check ----------------
async function waitForBackend(url, timeout = 30000, interval = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        // no me interesa el body, solo el 200
        return true;
      }
    } catch (e) {
      // todavía no levantó
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error("Backend no respondió a tiempo");
}

// ---------------- Arranque ----------------
app.on("ready", async () => {
  createSplash();
  startBackend();

  try {
    await waitForBackend(BACKEND_HEALTH_URL, 30000, 1000);
    createMainWindow();
  } catch (err) {
    console.error("Error iniciando backend:", err);
    if (splashWin) {
      splashWin.webContents.executeJavaScript(
        `document.body.innerHTML = '<h3 style="color:red;text-align:center;">Error iniciando backend</h3>'`
      );
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
