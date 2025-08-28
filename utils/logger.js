const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      ...meta
    });
  }

  writeToFile(level, message, meta = {}) {
    const logFile = path.join(this.logDir, `${level}.log`);
    const logEntry = this.formatMessage(level, message, meta) + '\n';
    
    fs.appendFileSync(logFile, logEntry);
  }

  info(message, meta = {}) {
    console.log(`[INFO] ${message}`, meta);
    this.writeToFile('info', message, meta);
  }

  error(message, meta = {}) {
    console.error(`[ERROR] ${message}`, meta);
    this.writeToFile('error', message, meta);
  }

  warn(message, meta = {}) {
    console.warn(`[WARN] ${message}`, meta);
    this.writeToFile('warn', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta);
      this.writeToFile('debug', message, meta);
    }
  }
}

module.exports = new Logger();
