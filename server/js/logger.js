class Logger {
    constructor(level) {
        this.level = level || 'info';
    }

    error(message) {
        if (['error', 'debug', 'info'].includes(this.level)) {
            console.error('[ERROR]', message);
        }
    }

    info(message) {
        if (['info', 'debug'].includes(this.level)) {
            console.info('[INFO]', message);
        }
    }

    debug(message) {
        if (this.level === 'debug') {
            console.debug('[DEBUG]', message);
        }
    }
}

module.exports = Logger;