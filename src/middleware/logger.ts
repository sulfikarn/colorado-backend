import winston from 'winston';
import expressWinston from 'express-winston';

const isRunningTests:any = process.env.TEST || false;
/**
 * Logger Middleware
 */

export const logger = expressWinston.logger({

  transports: [
    new winston.transports.Console(),
  ],
  skip: () => isRunningTests,
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
  ),
  meta: true,
  msg: '{{err.message}} {{res.statusCode}} {{req.method}}',
  expressFormat: true,
  colorize: false,
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console(),
  ],
  skip: () => isRunningTests,
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
  ),
});

