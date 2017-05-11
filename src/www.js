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
const debug = _debug('meetus:server');

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '9000');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

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
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

/**
 * Create database if database does not exist.
 */
const databaseName = 'yamp.db';
const databasePath = path.join(__dirname, '../database');
database.openDatabase(databasePath, databaseName);

/**
 * Shutdown the server.
 */ 
function shutdownServer() {
    console.log("Received kill signal, shutting down.");
    server.close(()=>{
        database.closeDatabase();
        process.exit()
    });
}

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', shutdownServer);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', shutdownServer);   
