const fetch = require('node-fetch');
const AppConfig = require('../config/app-config');
const Logger = require('../utils/logger');

  /**
   * Backend health checker
   */
class HealthChecker {
  constructor() {
    this.healthUrl = AppConfig.backend.healthCheckUrl;
    this.timeout = AppConfig.backend.startupTimeout;
    this.interval = AppConfig.backend.healthCheckInterval;
  }

  /**
   * Waits for the backend to be available
   */
  async waitForBackend(url = null, timeout = null, interval = null) {
    const targetUrl = url || this.healthUrl;
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
   * Checks backend health once
   */
  async checkHealth(url = null) {
    const targetUrl = url || this.healthUrl;
    
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
   * Starts continuous monitoring of backend health
   */
  startHealthMonitoring(callback, interval = 30000) {
    Logger.info(`Starting health monitoring every ${interval}ms`);
    
    this.healthInterval = setInterval(async () => {
      const isHealthy = await this.checkHealth();
      if (callback) {
        callback(isHealthy);
      }
    }, interval);

    return this.healthInterval;
  }

  /**
   * Stops health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
      Logger.info('Health monitoring stopped');
    }
  }
}

module.exports = HealthChecker;
