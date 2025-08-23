const path = require('path');
const { app } = require('electron');

/**
 * Utilities for handling paths consistently in Electron
 */
class PathUtils {
  /**
   * Gets the application base path
   */
  static getAppPath() {
    return app.getAppPath();
  }

  /**
   * Gets the backend path based on environment
   */
  static getBackendPath() {
    const isDev = !app.isPackaged;
    return isDev
      ? path.join(__dirname, '..', '..', 'backend','ps-api', 'ps-api.exe')
      : path.join(process.resourcesPath, 'backend', 'ps-api', 'ps-api.exe');
  }

  /**
   * Gets the public files path
   */
  static getPublicPath() {
    return path.join(__dirname, '..', '..', 'public');
  }

  /**
   * Gets the splash folder path
   */
  static getSplashPath() {
    return path.join(__dirname, '..', 'splash');
  }

  /**
   * Gets the dist folder path (Angular build)
   */
  static getDistPath() {
    return path.join(__dirname, '..', '..', 'dist', 'preaching-sheet-front');
  }

  /**
   * Gets the application icon path
   */
  static getIconPath() {
    return path.join(this.getPublicPath(), 'icon.png');
  }

  /**
   * Gets the favicon path
   */
  static getFaviconPath() {
    return path.join(this.getPublicPath(), 'favicon.ico');
  }

  /**
   * Gets the Python service path based on environment
   * @deprecated Use getImageGeneratorApiPath() instead
   */
  static getPythonServicePath() {
    const isDev = !app.isPackaged;
    return isDev
      ? path.join(__dirname, '..', '..', '..', 'excel-to-image-service')
      : path.join(process.resourcesPath, 'excel-to-image-service');
  }

  /**
   * Gets the Image Generator API path based on environment
   */
  static getImageGeneratorApiPath() {
    const isDev = !app.isPackaged;
    return isDev
      ? path.join(__dirname, '..', '..', 'backend','image-generator-api')
      : path.join(process.resourcesPath, 'backend', 'image-generator-api');
  }
}

module.exports = PathUtils;
