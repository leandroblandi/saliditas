const fetch = require('node-fetch');
const AppConfig = require('../config/app-config');
const Logger = require('../utils/logger');

/**
 * Service health checker for both backend and Image Generator API service
 */
class HealthChecker {
  constructor() {
    this.backendHealthUrl = AppConfig.backend.healthCheckUrl;
    this.imageGeneratorHealthUrl = AppConfig.imageGeneratorService.healthCheckUrl;
    this.timeout = AppConfig.backend.startupTimeout;
    this.interval = AppConfig.backend.healthCheckInterval;
  }

  /**
   * Waits for the backend to be available
   */
  async waitForBackend(url = null, timeout = null, interval = null) {
    const targetUrl = url || this.backendHealthUrl;
    const targetTimeout = timeout || this.timeout;
    const targetInterval = interval || this.interval;

    Logger.info(`Waiting for backend to be available at: ${targetUrl}`);
    Logger.info(`Timeout: ${targetTimeout}ms, Interval: ${targetInterval}ms`);

    const start = Date.now();
    let attempts = 0;

    while (Date.now() - start < targetTimeout) {
      attempts++;
      
      try {
        Logger.debug(`Attempt ${attempts}: Checking backend...`);
        
        const response = await fetch(targetUrl, {
          method: 'GET',
          timeout: 5000 // 5 segundos de timeout por request
        });

        if (response.ok) {
          Logger.info(`Backend available after ${attempts} attempts`);
          return true;
        } else {
          Logger.debug(`Backend responded with status: ${response.status}`);
        }
      } catch (error) {
        Logger.debug(`Attempt ${attempts} failed: ${error.message}`);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, targetInterval));
    }

    const errorMessage = `Backend did not respond after ${targetTimeout}ms`;
    Logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Waits for the Image Generator API service to be available
   */
  async waitForImageGeneratorService(url = null, timeout = null, interval = null) {
    const targetUrl = url || this.imageGeneratorHealthUrl;
    const targetTimeout = timeout || this.timeout;
    const targetInterval = interval || this.interval;

    Logger.info(`Waiting for Image Generator API service to be available at: ${targetUrl}`);
    Logger.info(`Timeout: ${targetTimeout}ms, Interval: ${targetInterval}ms`);

    const start = Date.now();
    let attempts = 0;

    while (Date.now() - start < targetTimeout) {
      attempts++;
      
      try {
        Logger.debug(`Attempt ${attempts}: Checking Image Generator API service...`);
        
        const response = await fetch(targetUrl, {
          method: 'GET',
          timeout: 5000 // 5 segundos de timeout por request
        });

        if (response.ok) {
          Logger.info(`Image Generator API service available after ${attempts} attempts`);
          return true;
        } else {
          Logger.debug(`Image Generator API service responded with status: ${response.status}`);
        }
      } catch (error) {
        Logger.debug(`Attempt ${attempts} failed: ${error.message}`);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, targetInterval));
    }

    const errorMessage = `Image Generator API service did not respond after ${targetTimeout}ms`;
    Logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Waits for all services to be available
   */
  async waitForAllServices() {
    Logger.info('Waiting for all services to be available...');
    
    try {
      // Wait for both services in parallel
      await Promise.all([
        this.waitForBackend(),
        this.waitForImageGeneratorService()
      ]);
      
      Logger.info('All services are available');
      return true;
    } catch (error) {
      Logger.error('Error waiting for services:', error);
      throw error;
    }
  }

  /**
   * Checks backend health once
   */
  async checkBackendHealth(url = null) {
    const targetUrl = url || this.backendHealthUrl;
    
    try {
      Logger.debug(`Checking backend health at: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        Logger.debug('Backend is healthy');
        return true;
      } else {
        Logger.warn(`Backend responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      Logger.error(`Error checking backend health: ${error.message}`);
      return false;
    }
  }

  /**
   * Checks Image Generator API service health once
   */
  async checkImageGeneratorServiceHealth(url = null) {
    const targetUrl = url || this.imageGeneratorHealthUrl;
    
    try {
      Logger.debug(`Checking Image Generator API service health at: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        Logger.debug('Image Generator API service is healthy');
        return true;
      } else {
        Logger.warn(`Image Generator API service responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      Logger.error(`Error checking Image Generator API service health: ${error.message}`);
      return false;
    }
  }

  /**
   * Checks all services health
   */
  async checkAllServicesHealth() {
    try {
      const [backendHealthy, imageGeneratorHealthy] = await Promise.all([
        this.checkBackendHealth(),
        this.checkImageGeneratorServiceHealth()
      ]);
      
      return {
        backend: backendHealthy,
        imageGeneratorService: imageGeneratorHealthy,
        allHealthy: backendHealthy && imageGeneratorHealthy
      };
    } catch (error) {
      Logger.error('Error checking all services health:', error);
      return {
        backend: false,
        imageGeneratorService: false,
        allHealthy: false
      };
    }
  }

  /**
   * Starts continuous monitoring of all services health
   */
  startHealthCheck(callback, interval = 30000) {
    Logger.info(`Starting health monitoring every ${interval}ms`);
    
    this.healthInterval = setInterval(async () => {
      const healthStatus = await this.checkAllServicesHealth();
      if (callback) {
        callback(healthStatus);
      }
    }, interval);

    return this.healthInterval;
  }

  /**
   * Stops health monitoring
   */
  stopHealthCheck() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
      Logger.info('Health monitoring stopped');
    }
  }

  // Legacy method names for backward compatibility
  async waitForPythonService(url, timeout, interval) {
    return this.waitForImageGeneratorService(url, timeout, interval);
  }

  async checkPythonServiceHealth(url) {
    return this.checkImageGeneratorServiceHealth(url);
  }

  startHealthMonitoring(callback, interval) {
    return this.startHealthCheck(callback, interval);
  }

  stopHealthMonitoring() {
    return this.stopHealthCheck();
  }
}

module.exports = HealthChecker;
