const { spawn } = require('child_process');
const PathUtils = require('../utils/path-utils');
const Logger = require('../utils/logger');

  /**
   * Backend process manager
   */
class BackendManager {
  constructor() {
    this.backendProcess = null;
    this.isRunning = false;
  }

  /**
   * Starts the backend process
   */
  startBackend() {
    try {
      Logger.info('Starting backend process...');
      
      const backendPath = PathUtils.getBackendPath();
      Logger.debug(`Backend path: ${backendPath}`);

      this.backendProcess = spawn(backendPath, [], {
        detached: false, // Changed to false to ensure proper cleanup
        stdio: 'ignore',
        windowsHide: true
      });

      this.isRunning = true;

      // Handle process events
      this.backendProcess.on('error', (error) => {
        Logger.error('Error starting backend:', error);
        this.isRunning = false;
      });

      this.backendProcess.on('exit', (code, signal) => {
        Logger.info(`Backend terminated with code: ${code}, signal: ${signal}`);
        this.isRunning = false;
      });

      Logger.info('Backend process started successfully');
      return true;
    } catch (error) {
      Logger.error('Error starting backend:', error);
      this.isRunning = false;
      return false;
    }
  }

  /**
   * Stops the backend process
   */
  stopBackend() {
    if (this.backendProcess && this.isRunning) {
      Logger.info('Stopping backend process...');
      
      try {
        // Try graceful shutdown first
        if (process.platform === 'win32') {
          // On Windows, use taskkill to ensure the process is terminated
          const { exec } = require('child_process');
          exec(`taskkill /F /PID ${this.backendProcess.pid}`, (error) => {
            if (error) {
              Logger.warn('Taskkill failed, trying direct kill:', error.message);
              this.backendProcess.kill('SIGKILL');
            }
          });
        } else {
          // On other platforms, try SIGTERM first, then SIGKILL
          this.backendProcess.kill('SIGTERM');
          
          // Force kill after 3 seconds if still running
          setTimeout(() => {
            if (this.isBackendRunning()) {
              Logger.warn('Backend still running, forcing kill...');
              this.backendProcess.kill('SIGKILL');
            }
          }, 3000);
        }
        
        this.isRunning = false;
        Logger.info('Backend process stop command sent');
      } catch (error) {
        Logger.error('Error stopping backend:', error);
        // Force kill as fallback
        try {
          this.backendProcess.kill('SIGKILL');
        } catch (killError) {
          Logger.error('Failed to force kill backend:', killError);
        }
      }
    }
  }

  /**
   * Checks if the backend is running
   */
  isBackendRunning() {
    if (!this.isRunning || !this.backendProcess) {
      return false;
    }
    
    // Check if process is still alive
    try {
      // On Windows, check if process exists
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try {
          execSync(`tasklist /FI "PID eq ${this.backendProcess.pid}" 2>NUL | find "${this.backendProcess.pid}" >NUL`);
          return true;
        } catch {
          return false;
        }
      } else {
        // On Unix-like systems, send signal 0 to check if process exists
        this.backendProcess.kill(0);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the backend process
   */
  getBackendProcess() {
    return this.backendProcess;
  }

  /**
   * Restarts the backend
   */
  restartBackend() {
    Logger.info('Restarting backend...');
    this.stopBackend();
    
    // Wait a bit before restarting
    setTimeout(() => {
      this.startBackend();
    }, 1000);
  }

  /**
   * Force kills all backend processes (emergency cleanup)
   */
  forceKillAllBackends() {
    Logger.warn('Force killing all backend processes...');
    
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        // Kill all ps-api.exe processes
        execSync('taskkill /F /IM ps-api.exe 2>NUL', { stdio: 'ignore' });
      } else {
        // On Unix-like systems, kill by process name
        const { execSync } = require('child_process');
        execSync('pkill -f ps-api', { stdio: 'ignore' });
      }
      
      this.isRunning = false;
      this.backendProcess = null;
      Logger.info('All backend processes force killed');
    } catch (error) {
      Logger.error('Error force killing backend processes:', error);
    }
  }
}

module.exports = BackendManager;
