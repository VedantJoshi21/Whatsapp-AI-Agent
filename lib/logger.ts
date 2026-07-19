/*{
    Function Name: logToFile
    Purpose: Appends a log entry to a daily log file in the logs directory
    Parameters: level (string), category (string), data (any)
    Returns: void
}*/
const logToFile = (level: 'INFO' | 'ERROR' | 'WARN', category: string, data: unknown) => {
  // Only execute on the server (Node.js environment)
  if (typeof window !== 'undefined') return;

  try {
    // Dynamic require to prevent browser bundlers from attempting to resolve these modules
    // Use try/catch and check environment to be extra safe
    const fs = require('fs');
    const path = require('path');
    
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(logsDir, `${date}.log`);
    
    const timestamp = new Date().toISOString();
    const message = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const logEntry = `[${timestamp}] [${level}] [${category}] ${message}\n---\n`;

    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    // Silently fail or log to console if file logging fails
    console.error('File Logging Error:', err);
  }
};

export const logger = {
  /*{
      Function Name: info
      Purpose: Logs informational data
      Parameters: category (string), data (any)
  }*/
  info: (category: string, data: unknown) => {
    console.log(`[INFO] [${category}]`, typeof data === 'string' ? data : '');
    if (typeof window === 'undefined') {
      logToFile('INFO', category, data);
    }
  },

  /*{
      Function Name: error
      Purpose: Logs error data
      Parameters: category (string), data (any)
  }*/
  error: (category: string, data: unknown) => {
    console.error(`[ERROR] [${category}]`, data);
    if (typeof window === 'undefined') {
      logToFile('ERROR', category, data);
    }
  },

  /*{
      Function Name: warn
      Purpose: Logs warning data
      Parameters: category (string), data (any)
  }*/
  warn: (category: string, data: unknown) => {
    console.warn(`[WARN] [${category}]`, data);
    if (typeof window === 'undefined') {
      logToFile('WARN', category, data);
    }
  }
};
