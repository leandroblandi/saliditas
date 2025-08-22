const { app } = require('electron');
const WindowManager = require('./window-manager');
const BackendManager = require('./backend-manager');
const HealthChecker = require('./health-checker');
const Logger = require('../utils/logger');

/**
 * Main Electron application
 */
class ElectronApp {
  constructor() {
    this.windowManager = new WindowManager();
    this.backendManager = new BackendManager();
    this.healthChecker = new HealthChecker();
    this.isInitialized = false;
    this.isCleaningUp = false;
  }

  /**
   * Initializes the application
   */
  async initialize() {
    try {
      Logger.info('Initializing Electron application...');
      
      // Create splash window
      this.windowManager.createSplash();
      
      // Start backend
      const backendStarted = this.backendManager.startBackend();
      if (!backendStarted) {
        throw new Error('Could not start backend');
      }

      // Wait for backend to be available
      await this.healthChecker.waitForBackend();
      
      // Create main window
      this.windowManager.createMainWindow();
      
      this.isInitialized = true;
      Logger.info('Application initialized successfully');
      
    } catch (error) {
      Logger.error('Error during initialization:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Handles initialization errors
   */
  handleInitializationError(error) {
    const splashWin = this.windowManager.getSplashWindow();
    
    if (splashWin) {
      splashWin.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="text-align:center;padding:20px;color:red;">
          <h3>Error starting application</h3>
          <p>${error.message}</p>
          <button onclick="window.close()">Close</button>
        </div>';
      `);
    }
  }

  /**
   * Cleans up resources when closing
   */
  async cleanup() {
    if (this.isCleaningUp) {
      Logger.info('Cleanup already in progress, skipping...');
      return;
    }
    
    this.isCleaningUp = true;
    Logger.info('Cleaning up application resources...');
    
    try {
      // Stop health monitoring
      this.healthChecker.stopHealthMonitoring();
      
      // Stop backend
      this.backendManager.stopBackend();
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force kill if still running
      if (this.backendManager.isBackendRunning()) {
        Logger.warn('Backend still running, force killing...');
        this.backendManager.forceKillAllBackends();
      }
      
      // Close windows
      this.windowManager.closeAllWindows();
      
      Logger.info('Cleanup completed');
    } catch (error) {
      Logger.error('Error during cleanup:', error);
    } finally {
      this.isCleaningUp = false;
    }
  }
}

// Global application instance
const electronApp = new ElectronApp();

// Application events
app.on('ready', async () => {
  await electronApp.initialize();
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await electronApp.cleanup();
    app.quit();
  }
});

app.on('before-quit', async () => {
  await electronApp.cleanup();
});

app.on('will-quit', async () => {
  // Ensure cleanup happens before app quits
  await electronApp.cleanup();
});

app.on('activate', () => {
  // On macOS, re-create the window when clicking the dock icon
  if (process.platform === 'darwin' && !electronApp.windowManager.getMainWindow()) {
    electronApp.windowManager.createMainWindow();
  }
});

// Handle process termination signals
process.on('SIGINT', async () => {
  Logger.info('SIGINT received, shutting down...');
  await electronApp.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down...');
  await electronApp.cleanup();
  process.exit(0);
});

// Unhandled error handling
process.on('uncaughtException', async (error) => {
  Logger.error('Uncaught exception:', error);
  await electronApp.cleanup();
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled promise rejection:', reason);
});
