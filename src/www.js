#!/usr/local/bin/node

/**
 * Module dependencies.
 */
import 'babel-polyfill';
import _debug from 'debug';
import http from 'http';
import path from 'path';

import app from './app';
import database from './database';

const debug = _debug('yamp:www');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
        // named pipe
    return val;
  }

  if (port >= 0) {
        // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '9000');
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;

    // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Create database if database does not exist.
 */
let databaseName = 'yamp.db';
const databasePath = path.join(__dirname, '../database');
debug(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'test') {
  databaseName = 'yamp_test.db';
}
database.openDatabase(databasePath, databaseName);

/**
 * Shutdown the server.
 */
function shutdownServer() {
  debug('Received kill signal, shutting down.');
  server.close(() => {
    database.closeDatabase();
    process.exit();
  });
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', shutdownServer);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutdownServer);

export default app;
