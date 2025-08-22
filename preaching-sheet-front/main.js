
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let splashWin;
let appWin;
let backendProcess;

const isDev = !app.isPackaged;

const backendPath = isDev
  ? path.join(__dirname, "backend", "ps-api.exe")
  : path.join(process.resourcesPath, "backend", "ps-api.exe");

const SPLASH_DURATION = 10000; // 20 segundos

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
        titleBarStyle: 'default',
        titleBarOverlay: {
            color: '#ffffff',        
            symbolColor: '#000000',  
            height: 32 
        },
        backgroundColor: '#ffffff',
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

// ---------------- Arranque ----------------
app.on("ready", () => {
    // Arrancamos el Splash
    createSplash();

    // Arrancamos el backend oculto
    backendProcess = spawn(backendPath, [], {
        detached: true,
        stdio: "ignore",
        windowsHide: true
    });
    backendProcess.unref();

    // Esperamos 20 segundos antes de abrir la ventana principal
    setTimeout(() => {
        createMainWindow();
    }, SPLASH_DURATION);
});



app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        if (backendProcess) backendProcess.kill();
        app.quit();
    }
});
