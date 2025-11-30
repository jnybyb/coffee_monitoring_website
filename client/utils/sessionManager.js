/**
 * Session Manager Utility
 * Handles automatic logout when server restarts
 */

class SessionManager {
  constructor() {
    this.serverStartupTime = null;
    this.checkInterval = null;
    this.checkFrequency = 30000; // Check every 30 seconds
    this.init();
  }

  async init() {
    try {
      await this.updateServerStartupTime();
      this.startPeriodicCheck();
      
      // Clean up on page unload
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          this.stopPeriodicCheck();
        });
      }
    } catch (error) {
      console.error('Failed to initialize session manager:', error);
    }
  }

  async updateServerStartupTime() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/server-startup', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        this.serverStartupTime = data.serverStartup;
        console.log('Server startup time updated:', new Date(this.serverStartupTime).toISOString());
      }
    } catch (error) {
      // Silently handle errors during initialization
      if (error.name !== 'AbortError') {
        console.warn('Failed to get server startup time:', error.message);
      }
    }
  }

  startPeriodicCheck() {
    this.checkInterval = setInterval(async () => {
      await this.checkServerRestart();
    }, this.checkFrequency);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async checkServerRestart() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/server-startup', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // If server startup time changed, server was restarted
        if (this.serverStartupTime && this.serverStartupTime !== data.serverStartup) {
          console.log('Server restart detected, logging out user');
          this.handleServerRestart();
          return;
        }
        
        // Update startup time if it's the first check
        if (!this.serverStartupTime) {
          this.serverStartupTime = data.serverStartup;
        }
      }
    } catch (error) {
      // Silently handle errors to avoid console spam
      if (error.name !== 'AbortError') {
        console.warn('Failed to check server restart:', error.message);
      }
    }
  }

  handleServerRestart() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear session storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Stop periodic checking
    this.stopPeriodicCheck();
    
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?message=server_restart';
    }
  }

  // Method to manually logout
  logout() {
    this.stopPeriodicCheck();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  // Method to check if user should be logged out
  shouldLogout() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return true;
    
    try {
      // Decode JWT token to check server startup time
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.serverStartup !== this.serverStartupTime) {
        return true;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
    
    return false;
  }
}

// Create and export singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
