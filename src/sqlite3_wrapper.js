/**
 * Promisify sqlite3 API.
 * @module qlite3_wrapper
 */
import _sqlite3 from 'sqlite3';
import _debug from 'debug';

const debug = _debug('database:sqlite3Wrapper');

/** Set the execution mode to verbose to produce long stack traces */
const sqlite3 = _sqlite3.verbose();

/** Hold the database connection */
let databaseConnection;

/**
 * Open the database connection. Promisified sqlite3 Database#new sqlite3.Database.
 * @see https://github.com/mapbox/node-sqlite3/wiki/API#new-sqlite3databasefilename-mode-callback
 * @param {String} databaseFullName - Path and name of the database file
 * @return {Promise}
 */
function getConnection(databaseFullName) {
  return new Promise((resolve, reject) => {
        // initialize databaseConnection module property
    databaseConnection = new sqlite3.Database(databaseFullName, (err) => {
      if (err) {
        debug(`ERROR [getConnection] database: ${databaseFullName}`, err);
        reject(err);
      }
    });
    debug(`[getConnection] connected to database: ${databaseFullName}`);
    resolve(databaseConnection);
  });
}

/**
 * Close the database connection. Promisified sqlite3 Database#close.
 * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseclosecallback
 * @param {String} databaseFullName - Path and name of the database file
 * @return {Promise}
 */
function closeConnection(databaseFullName) {
  return new Promise((resolve, reject) => {
    databaseConnection.close((err) => {
      debug('[closeConnection]', databaseFullName);
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Promisified sqlite3 Database#run.
 * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
 * @param {String} sqlStatement - sql statement to be executed
 * @param {String} statementDescription - description of the sql statement
 * @return {Promise}
 */
function runPromisified(sqlStatement, statementDescription) {
  return new Promise((resolve, reject) => {
    databaseConnection.run(sqlStatement, (err) => {
      if (statementDescription) {
        debug('[runPromisified]', statementDescription);
      }
      if (err) {
        debug('RUN:', err);
        reject(err);
      } else {
                // according to sqlite3 documentation:
          // "The context of the function (the this object inside the function)
          // is the statement object."
        resolve(this);
      }
    });
  });
}

/**
 * Promisified sqlite3 Database#get.
 * @see https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback
 * @param {String} sqlStatement - sql statement to be executed
 * @param {String} statementDescription - description of the sql statement
 * @return {Promise}
 */
function getPromisified(sqlStatement, statementDescription) {
  return new Promise((resolve, reject) => {
    databaseConnection.get(sqlStatement, (err, row) => {
      if (statementDescription) {
        debug('[getPromisified]', statementDescription);
      }
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Promisified sqlite3 Database#all.
 * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseallsql-param--callback
 * @param {String} sqlStatement - sql statement to be executed
 * @param {String} statementDescription - description of the sql statement
 * @return {Promise}
 */
function allPromisified(sqlStatement, statementDescription) {
  return new Promise((resolve, reject) => {
    databaseConnection.all(sqlStatement, (err, rows) => {
      if (statementDescription) {
        debug('[allPromisified]', statementDescription);
      }
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


module.exports = { getConnection, closeConnection, runPromisified, getPromisified, allPromisified };
