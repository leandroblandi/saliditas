const { spawn } = require('child_process');
const PathUtils = require('../utils/path-utils');
const Logger = require('../utils/logger');
const path = require('path');

/**
 * Image Generator API service process manager
 * Now manages the Excel to Image Generator API executable
 */
class ImageGeneratorServiceManager {
  constructor() {
    this.imageGeneratorProcess = null;
    this.isRunning = false;
  }

  /**
   * Starts the Image Generator API service process
   */
  startImageGeneratorService() {
    try {
      Logger.info('Starting Image Generator API service process...');
      
      const imageGeneratorPath = PathUtils.getImageGeneratorApiPath();
      Logger.debug(`Image Generator API path: ${imageGeneratorPath}`);

      // Execute the EXE directly
      const exePath = path.join(imageGeneratorPath, 'excel-image-generator-api.exe');
      Logger.info(`Executable path: ${exePath}`);
      
      // Check if executable exists
      const fs = require('fs');
      if (!fs.existsSync(exePath)) {
        Logger.error(`Executable not found at: ${exePath}`);
        return false;
      }
      Logger.info('Executable found, starting process...');
      
      this.imageGeneratorProcess = spawn(exePath, [], {
        detached: false,
        stdio: 'pipe', // Capture output for debugging
        windowsHide: true,
        cwd: imageGeneratorPath // Set working directory to image generator folder
      });

      this.isRunning = true;
      Logger.info(`Process started with PID: ${this.imageGeneratorProcess.pid}`);

      // Handle process events
      this.imageGeneratorProcess.on('error', (error) => {
        Logger.error('Error starting Image Generator API service:', error);
        this.isRunning = false;
      });

      this.imageGeneratorProcess.on('exit', (code, signal) => {
        Logger.info(`Image Generator API service terminated with code: ${code}, signal: ${signal}`);
        this.isRunning = false;
      });

      // Log stdout and stderr for debugging
      this.imageGeneratorProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        Logger.info(`Image Generator API stdout: ${output}`);
        
        // Check if the service is ready
        if (output.includes('running') || output.includes('started') || output.includes('listening')) {
          Logger.info('Image Generator API service appears to be ready');
        }
      });

      this.imageGeneratorProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        Logger.warn(`Image Generator API stderr: ${output}`);
      });

      Logger.info('Image Generator API service process started successfully');
      return true;
    } catch (error) {
      Logger.error('Error starting Image Generator API service:', error);
      this.isRunning = false;
      return false;
    }
  }

  /**
   * Stops the Image Generator API service process
   */
  stopImageGeneratorService() {
    if (this.imageGeneratorProcess && this.isRunning) {
      Logger.info('Stopping Image Generator API service process...');
      
      try {
        // Try graceful shutdown first
        if (process.platform === 'win32') {
          // On Windows, use taskkill to ensure the process is terminated
          const { exec } = require('child_process');
          exec(`taskkill /F /PID ${this.imageGeneratorProcess.pid}`, (error) => {
            if (error) {
              Logger.warn('Taskkill failed, trying direct kill:', error.message);
              this.imageGeneratorProcess.kill('SIGKILL');
            }
          });
        } else {
          // On other platforms, try SIGTERM first, then SIGKILL
          this.imageGeneratorProcess.kill('SIGTERM');
          
          // Force kill after 3 seconds if still running
          setTimeout(() => {
            if (this.isImageGeneratorServiceRunning()) {
              Logger.warn('Image Generator API service still running, forcing kill...');
              this.imageGeneratorProcess.kill('SIGKILL');
            }
          }, 3000);
        }
        
        this.isRunning = false;
        Logger.info('Image Generator API service process stop command sent');
      } catch (error) {
        Logger.error('Error stopping Image Generator API service:', error);
        // Force kill as fallback
        try {
          this.imageGeneratorProcess.kill('SIGKILL');
        } catch (killError) {
          Logger.error('Failed to force kill Image Generator API service:', killError);
        }
      }
    }
  }

  /**
   * Checks if the Image Generator API service is running
   */
  isImageGeneratorServiceRunning() {
    if (!this.isRunning || !this.imageGeneratorProcess) {
      return false;
    }
    
    // Check if process is still alive
    try {
      // On Windows, check if process exists
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try {
          execSync(`tasklist /FI "PID eq ${this.imageGeneratorProcess.pid}" 2>NUL | find "${this.imageGeneratorProcess.pid}" >NUL`);
          return true;
        } catch {
          return false;
        }
      } else {
        // On Unix-like systems, send signal 0 to check if process exists
        this.imageGeneratorProcess.kill(0);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if the Image Generator API service is responding on the expected port
   */
  async isImageGeneratorServiceResponding() {
    if (!this.isImageGeneratorServiceRunning()) {
      return false;
    }

    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5001/health', {
        method: 'GET',
        timeout: 5000
      });
      
      Logger.debug(`Image Generator API health check response: ${response.status}`);
      return response.ok;
    } catch (error) {
      Logger.debug(`Image Generator API health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Waits for the Image Generator API service to be ready
   */
  async waitForServiceReady(timeout = 30000, interval = 1000) {
    Logger.info(`Waiting for Image Generator API service to be ready (timeout: ${timeout}ms)...`);
    
    const start = Date.now();
    let attempts = 0;
    
    while (Date.now() - start < timeout) {
      attempts++;
      
      try {
        if (await this.isImageGeneratorServiceResponding()) {
          Logger.info(`Image Generator API service is ready after ${attempts} attempts`);
          return true;
        }
        
        Logger.debug(`Attempt ${attempts}: Service not ready yet...`);
      } catch (error) {
        Logger.debug(`Attempt ${attempts} failed: ${error.message}`);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    Logger.error(`Image Generator API service did not become ready after ${timeout}ms`);
    return false;
  }

  /**
   * Gets the Image Generator API service process
   */
  getImageGeneratorProcess() {
    return this.imageGeneratorProcess;
  }

  /**
   * Restarts the Image Generator API service
   */
  restartImageGeneratorService() {
    Logger.info('Restarting Image Generator API service...');
    this.stopImageGeneratorService();
    
    // Wait a bit before restarting
    setTimeout(() => {
      this.startImageGeneratorService();
    }, 1000);
  }

  /**
   * Force kills all Image Generator API service processes (emergency cleanup)
   */
  forceKillAllImageGeneratorServices() {
    Logger.warn('Force killing all Image Generator API service processes...');
    
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        // Kill all excel-image-generator-api.exe processes
        execSync('taskkill /F /IM excel-image-generator-api.exe 2>NUL', { stdio: 'ignore' });
      } else {
        // On Unix-like systems, kill by process name
        const { execSync } = require('child_process');
        execSync('pkill -f "excel-image-generator-api"', { stdio: 'ignore' });
      }
      
      this.isRunning = false;
      this.imageGeneratorProcess = null;
      Logger.info('All Image Generator API service processes force killed');
    } catch (error) {
      Logger.error('Error force killing Image Generator API service processes:', error);
    }
  }

  // Legacy method names for backward compatibility
  startPythonService() {
    return this.startImageGeneratorService();
  }

  stopPythonService() {
    return this.stopImageGeneratorService();
  }

  isPythonServiceRunning() {
    return this.isImageGeneratorServiceRunning();
  }

  getPythonProcess() {
    return this.getImageGeneratorProcess();
  }

  restartPythonService() {
    return this.restartImageGeneratorService();
  }

  forceKillAllPythonServices() {
    return this.forceKillAllImageGeneratorServices();
  }

  async waitForPythonServiceReady(timeout, interval) {
    return this.waitForServiceReady(timeout, interval);
  }

  async isPythonServiceResponding() {
    return this.isImageGeneratorServiceResponding();
  }
}

module.exports = ImageGeneratorServiceManager;
