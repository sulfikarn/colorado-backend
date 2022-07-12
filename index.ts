import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import {createTerminus} from '@godaddy/terminus';

// Routes
import authRouter from './src/routes/auth';
import userRouter from './src/routes/user-management/index';
import locationRouter from './src/routes/location-management/index';
import profileRouter from './src/routes/user-management/profile';
import deviceRouter from './src/routes/device-management/index';
import elasticAnalyticsRouter from './src/routes/elastic-analytics/index';
import mappingRouter from './src/routes/device-management/device-management';
import notificationRouter from './src/routes/notification/index';
import exportRouter from './src/routes/location-management/location-export';
// Middlewares
import {logger, errorLogger} from './src/middleware/logger';

// Configurations
import {PORT} from './src/constants';

// Database
import {connectionPool, disconnect} from './src/db/db';

const app = express();
const upTime = new Date(Date.now());


// Middlewares
app.use(helmet());
app.use(cors());
app.use(logger);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Loading routes
app.use('/api/v1', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', exportRouter);
app.use('/api/v1', locationRouter);
app.use('/api/v1', profileRouter);
app.use('/api/v1', deviceRouter);
app.use('/api/v1', elasticAnalyticsRouter);
app.use('/api/v1', mappingRouter);
app.use('/api/v1', notificationRouter);

// health check endpoint
app.get('/', function(req, res) {
  res.status(200).send({
    message: `Server up and running from ${upTime.toString()}`,
  });
});

// handle 404
app.get('*', function(req, res) {
  res.status(404).send({
    message: 'This handle do not exist',
  });
});

// Error logger
app.use(errorLogger);
// Default error handler
app.use(function(err:any, req:any, res:any, next:any) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const server = http.createServer(app);

// Gracefull server shutdown
createTerminus(server, {
  signal: 'SIGINT',
  beforeShutdown: async () =>
    disconnect(),
  // console.log('Gracefully shutting the server down'),
});


export default app;

/**
 * Starts the server
 */
async function startServer() {
  // Connect to database
  await connectionPool();
  if ( !process.env.TEST) {
    server.listen(PORT, () => {
      console.log(`server listening at http://localhost:${PORT}`);
    });
  }
}

startServer();
