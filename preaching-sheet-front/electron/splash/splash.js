const { app, BrowserWindow } = require("electron");
const path = require("path");

let splashWin;
let mainWin;

function createSplash() {
    splashWin = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,           // sin bordes ni barra de título
        transparent: true,      // fondo transparente si querés diseño
        alwaysOnTop: true,
        resizable: false,
        center: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    splashWin.loadFile(path.join(__dirname, 'splash.html')); // tu HTML del splash
}
