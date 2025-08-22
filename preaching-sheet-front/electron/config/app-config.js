/**
 * Centralized configuration for the Electron application
 */
const AppConfig = {
  // Application configuration
  app: {
    name: 'Saliditas App',
    version: '1.0.0',
    author: 'JW Organization'
  },

  // Window configuration
  windows: {
    splash: {
      width: 400,
      height: 300,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      center: true
    },
    main: {
      width: 1000,
      height: 800,
      resizable: true,
      titleBarStyle: 'default',
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#000000',
        height: 32
      },
      backgroundColor: '#ffffff'
    }
  },

  // Backend configuration
  backend: {
    healthCheckUrl: 'http://localhost:8082/psa/api/status',
    startupTimeout: 50000, // 30 seconds
    healthCheckInterval: 1000, // 1 second
    port: 8082
  },

  // WebPreferences configuration
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: false
  },

  // Development configuration
  development: {
    openDevTools: true,
    enableLogging: true
  }
};

module.exports = AppConfig;
