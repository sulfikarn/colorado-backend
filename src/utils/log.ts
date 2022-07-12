/**
 * Logging Module
 */
const winston = require('winston');

const myformat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info:any) =>
      `${info.timestamp} ${info.level}: ${info.message}`),
);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: myformat,
    },
    ),
  ],
});

logger.silent = process.env.LOG_DISABLED;

export default logger;
