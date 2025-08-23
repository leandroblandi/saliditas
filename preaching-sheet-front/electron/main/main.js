const { app } = require('electron');
const BackendManager = require('./backend-manager');
const WindowManager = require('./window-manager');
const ImageGeneratorServiceManager = require('./python-service-manager');
const HealthChecker = require('./health-checker');
const Logger = require('../utils/logger');

/**
 * Main application class
 */
class MainApp {
  constructor() {
    this.backendManager = new BackendManager();
    this.windowManager = new WindowManager();
    this.imageGeneratorServiceManager = new ImageGeneratorServiceManager();
    this.healthChecker = new HealthChecker();
    
    this.setupEventHandlers();
  }

  /**
   * Sets up event handlers for the application
   */
  setupEventHandlers() {
    // Handle app ready event
    app.whenReady().then(() => {
      this.onAppReady();
    });

    // Handle window closed event
    app.on('window-all-closed', () => {
      this.onAllWindowsClosed();
    });

    // Handle app activate event (macOS)
    app.on('activate', () => {
      this.onAppActivate();
    });

    // Handle app before quit event
    app.on('before-quit', () => {
      this.onAppBeforeQuit();
    });
  }

  /**
   * Called when the app is ready
   */
  async onAppReady() {
    Logger.info('Application ready, starting services...');
    
    try {
      // Start backend service
      const backendStarted = this.backendManager.startBackend();
      
      // Start image generator service
      const imageGeneratorServiceStarted = this.imageGeneratorServiceManager.startImageGeneratorService();
      
      if (backendStarted && imageGeneratorServiceStarted) {
        Logger.info('All services started successfully');
        
        // Wait for image generator service to be ready
        Logger.info('Waiting for Image Generator API service to be ready...');
        const serviceReady = await this.imageGeneratorServiceManager.waitForServiceReady(30000, 1000);
        
        if (serviceReady) {
          Logger.info('Image Generator API service is ready');
          
          // Start health checker
          this.healthChecker.startHealthCheck();
          
          // Create main window
          this.windowManager.createMainWindow();
        } else {
          Logger.error('Image Generator API service failed to become ready');
          app.quit();
        }
      } else {
        Logger.error('Failed to start one or more services');
        app.quit();
      }
    } catch (error) {
      Logger.error('Error during app initialization:', error);
      app.quit();
    }
  }

  /**
   * Called when all windows are closed
   */
  onAllWindowsClosed() {
    Logger.info('All windows closed');
    
    // On macOS, keep the app running when all windows are closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  /**
   * Called when the app is activated (macOS)
   */
  onAppActivate() {
    Logger.info('App activated');
    
    // On macOS, re-create the window when the dock icon is clicked
    if (process.platform === 'darwin' && !this.windowManager.getMainWindow()) {
      this.windowManager.createMainWindow();
    }
  }

  /**
   * Called before the app quits
   */
  onAppBeforeQuit() {
    Logger.info('Application quitting, cleaning up...');
    
    // Stop health checker
    this.healthChecker.stopHealthCheck();
    
    // Stop backend service
    this.backendManager.stopBackend();
    
    // Stop image generator service
    this.imageGeneratorServiceManager.stopImageGeneratorService();
    
    // Force kill any remaining processes
    if (this.imageGeneratorServiceManager.isImageGeneratorServiceRunning()) {
      Logger.warn('Image Generator service still running, force killing...');
      this.imageGeneratorServiceManager.forceKillAllImageGeneratorServices();
    }
    
    Logger.info('Cleanup completed');
  }
}

// Global application instance
const mainApp = new MainApp();

// Handle process termination signals
process.on('SIGINT', async () => {
  Logger.info('SIGINT received, shutting down...');
  // The cleanup logic is now handled within MainApp.onAppBeforeQuit
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down...');
  // The cleanup logic is now handled within MainApp.onAppBeforeQuit
  process.exit(0);
});

// Unhandled error handling
process.on('uncaughtException', async (error) => {
  Logger.error('Uncaught exception:', error);
  // The cleanup logic is now handled within MainApp.onAppBeforeQuit
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled promise rejection:', reason);
});
