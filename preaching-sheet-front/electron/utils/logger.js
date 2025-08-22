const { app } = require('electron');

/**
 * Simple logging system for Electron
 */
class Logger {
  static log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level.toLowerCase()) {
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'debug':
        if (!app.isPackaged) {
          console.log(prefix, message, ...args);
        }
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  static info(message, ...args) {
    this.log('info', message, ...args);
  }

  static warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  static error(message, ...args) {
    this.log('error', message, ...args);
  }

  static debug(message, ...args) {
    this.log('debug', message, ...args);
  }
}

module.exports = Logger;
