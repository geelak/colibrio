'use client';

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Logger function that sends logs to the server
export class RemoteLogger {
  private static instance: RemoteLogger;
  private endpoint: string;
  private device: string;
  private isEnabled: boolean = true;

  private constructor() {
    // Use relative URL for API endpoint for flexibility across environments
    this.endpoint = '/api/log';
    
    // Set device information
    this.device = this.getDeviceInfo();
  }

  // Singleton pattern for logger
  public static getInstance(): RemoteLogger {
    if (!RemoteLogger.instance) {
      RemoteLogger.instance = new RemoteLogger();
    }
    return RemoteLogger.instance;
  }

  // Get device information for better log context
  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    return `${platform} - ${windowWidth}x${windowHeight} - ${userAgent}`;
  }

  // Enable or disable logging
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Log to console and send to server
  public log(level: LogLevel, message: string, data?: any): void {
    if (!this.isEnabled || process.env.NODE_ENV === 'production') return;
    
    // Standard console logging
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, data);
        break;
      case LogLevel.INFO:
        console.info(message, data);
        break;
      case LogLevel.WARN:
        console.warn(message, data);
        break;
      case LogLevel.ERROR:
        console.error(message, data);
        break;
    }
    
    // Prepare log data
    const logData = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      device: this.device,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    
    // Send to server
    this.sendToServer(logData);
  }

  // Convenience methods
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  // Send log to server
  private sendToServer(logData: any): void {
    // Use fetch API to send logs to server
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      // Use no-cors to avoid CORS issues on external devices
      // mode: 'no-cors',
      // Don't fail if the request errors - this is just logging
      keepalive: true,
    }).catch((error) => {
      // Silent failure - we don't want logging errors to break the app
      console.error('Failed to send log to server:', error);
    });
  }
}

// Create default exports for easy usage
export const logger = RemoteLogger.getInstance();
export default logger; 