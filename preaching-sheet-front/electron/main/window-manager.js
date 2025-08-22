const { BrowserWindow } = require('electron');
const PathUtils = require('../utils/path-utils');
const AppConfig = require('../config/app-config');
const Logger = require('../utils/logger');
const path = require('path');

  /**
   * Application window manager
   */
class WindowManager {
  constructor() {
    this.splashWin = null;
    this.appWin = null;
  }

  /**
   * Creates the splash window
   */
  createSplash() {
    Logger.info('Creating splash window...');
    
    this.splashWin = new BrowserWindow({
      ...AppConfig.windows.splash,
      title: AppConfig.app.name,
      icon: PathUtils.getIconPath(),
      webPreferences: AppConfig.webPreferences
    });

    this.splashWin.loadFile(path.join(PathUtils.getSplashPath(), 'splash.html'));
    
    // Prevent accidental closing
    this.splashWin.on('close', (e) => {
      if (!this.appWin) {
        e.preventDefault();
      }
    });

    Logger.info('Splash window created successfully');
    return this.splashWin;
  }

  /**
   * Creates the main application window
   */
  createMainWindow() {
    Logger.info('Creating main window...');
    
    this.appWin = new BrowserWindow({
      ...AppConfig.windows.main,
      title: AppConfig.app.name,
      icon: PathUtils.getIconPath(),
      webPreferences: AppConfig.webPreferences
    });

    this.appWin.loadURL(`file://${PathUtils.getDistPath()}/index.html`);
    this.appWin.setMenu(null);
    this.appWin.maximize();

    // Open DevTools only in development
    if (AppConfig.development.openDevTools) {
      this.appWin.webContents.openDevTools();
    }

    // Close splash when main window opens
    if (this.splashWin) {
      this.splashWin.close();
      this.splashWin = null;
    }

    this.appWin.on('closed', () => {
      this.appWin = null;
      Logger.info('Main window closed');
    });

    Logger.info('Main window created successfully');
    return this.appWin;
  }

  /**
   * Closes all windows
   */
  closeAllWindows() {
    if (this.splashWin) {
      this.splashWin.close();
      this.splashWin = null;
    }
    
    if (this.appWin) {
      this.appWin.close();
      this.appWin = null;
    }
  }

  /**
   * Gets the splash window
   */
  getSplashWindow() {
    return this.splashWin;
  }

  /**
   * Gets the main window
   */
  getMainWindow() {
    return this.appWin;
  }
}

module.exports = WindowManager;
