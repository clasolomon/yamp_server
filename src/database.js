/**
 * Provide the database API layer.
 * @module database 
 */

/**
 * Module dependencies.
 */
import sqlite3_wrapper from './sqlite3_wrapper';
import path from 'path';
import assert from 'assert';

/** Hold the database fullname (path/name) */
let databaseFullName;

/**
 * Log message and error.
 *
 * @param {String} errMessage - Message to describe the last database operation
 * @return {Function} 
 * @throws {Error}
 */
function handleError(errMessage){
    return function(err){
        console.error(errMessage, err);
        throw err;
    }
}

/**
 * Open the database connection.
 * If the database file does not exist at the specified path, a new database will be created.
 * Check the database integrity.
 *
 * @param {String} databasePath - The path where the database is located
 * @param {String} databaseName - The name of the database file
 * @return undefined
 */
async function openDatabase(databasePath, databaseName){
    assert(databasePath, 'Database path must be specified!');
    assert(databaseName, 'Database name must be specified!');
    databaseFullName = path.join(databasePath, databaseName);

    await sqlite3_wrapper.getConnection(databaseFullName)
        .then((result)=>{
            return createDatabase();
        }).then((result)=>{
            return integrityCheck();
        }).catch(handleError('ERROR [openDatabase]'));
}

/**
 * Close database connection.
 * @return undefined
 */
async function closeDatabase(){
    await sqlite3_wrapper.closeConnection(databaseFullName)
        .catch(handleError('ERROR [closeDatabase]'));
}

/**
 * Check the integrity of the database.
 * @return {Promise}
 */
function integrityCheck(){
    return sqlite3_wrapper.allPromisified('PRAGMA integrity_check')
        .then((result)=>{ 
            if(result.length !== 1 || result[0].integrity_check !== 'ok'){
                console.error('[integrityCheck] INTEGRITY CHECK ERRORS:', result);
                throw new Error('database integrity check');
            }
        }).then((result)=>{
            return sqlite3_wrapper.allPromisified('PRAGMA foreign_key_check');
        }).then((result)=>{
                    if(result.length !== 0){
                        console.error('[integrityCheck] FOREIGN KEY ERRORS:', result);
                        throw new Error('foreign key integrity check');
                    }
        }).catch(handleError('ERROR [integrityCheck]'));
}

/**
 * Create the database.
 * Checks first if the table exists in the database and creates it only if it doesn't exist.
 * @return {Promise}
 */
function createDatabase(){
    // tables used when user is logged in
    const users_SQL ='CREATE TABLE users' +
        '(user_id TEXT PRIMARY KEY, user_name TEXT, email TEXT, password TEXT)';
    const meetings_SQL ='CREATE TABLE meetings' +
        '(meeting_id TEXT PRIMARY KEY, meeting_name TEXT, description TEXT, initiated_by INTEGER, proposed_dates_and_times TEXT, FOREIGN KEY(initiated_by) REFERENCES users(user_id))';
    const dates_and_times_SQL ='CREATE TABLE dates_and_times' +
        '(meeting_id TEXT, user_id TEXT, accepted_dates_and_times TEXT, PRIMARY KEY(meeting_id, user_id), FOREIGN KEY(meeting_id) REFERENCES meetings(meeting_id), FOREIGN KEY(user_id) REFERENCES users(user_id))'; 

    const queryForUsers = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="users"';
    const queryForMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="meetings"';
    const queryForDatesAndTimes = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="dates_and_times"';

    // tables used when user is NOT logged in
    const other_meetings_SQL = 'CREATE TABLE other_meetings' +
        '(meeting_id TEXT PRIMARY KEY, user_name TEXT, user_email TEXT, meeting_name TEXT, meeting_description TEXT, proposed_dates_and_times TEXT, invite_emails TEXT)';
    const other_dates_and_times_SQL = 'CREATE TABLE other_dates_and_times' +
        '(dates_and_times_id TEXT PRIMARY KEY, meeting_id TEXT, atendant_name TEXT, accepted_dates_and_times TEXT, FOREIGN KEY(meeting_id) REFERENCES other_meetings(meeting_id))';

    const queryForOtherMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="other_meetings"';
    const queryForOtherDatesAndTimes = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="other_dates_and_times"';

    return sqlite3_wrapper.getPromisified(queryForUsers)
        .then((result)=>{
            if(result && result.sql === users_SQL){
                console.log('[createDatabase] Table "users" exists.');
            } else {
                return sqlite3_wrapper.runPromisified(users_SQL, 'Create table "users".');
            }
        }).then((result)=>{
            return sqlite3_wrapper.getPromisified(queryForMeetings);
        }).then((result)=>{
            if(result && result.sql === meetings_SQL){
                console.log('[createDatabase] Table "meetings" exists.');
            } else {
                return sqlite3_wrapper.runPromisified(meetings_SQL, 'Create table "meetings".');
            }
        }).then((result)=>{
            return sqlite3_wrapper.getPromisified(queryForDatesAndTimes);
        }).then((result)=>{
            if(result && result.sql === dates_and_times_SQL){
                console.log('[createDatabase] Table "dates_and_times" exists.');
            } else {
                return sqlite3_wrapper.runPromisified(dates_and_times_SQL, 'Create table "dates_and_times".');
            }
        }).then((result)=>{
            return sqlite3_wrapper.getPromisified(queryForOtherMeetings);
        }).then((result)=>{
            if(result && result.sql === other_meetings_SQL){
                console.log('[createDatabase] Table "other_meetings" exists.');
            } else {
                return sqlite3_wrapper.runPromisified(other_meetings_SQL, 'Create table "other_meetings".');
            }
        }).then((result)=>{
            return sqlite3_wrapper.getPromisified(queryForOtherDatesAndTimes);
        }).then((result)=>{
            if(result && result.sql === other_dates_and_times_SQL){
                console.log('[createDatabase] Table "other_dates_and_times" exists.');
            } else {
                return sqlite3_wrapper.runPromisified(other_dates_and_times_SQL, 'Create table "other_dates_and_times".');
            }
        }).catch(handleError('ERROR [createDatabase]'));
}

//=============================== API for logged user ==========================================================

/**
 * Add entry to "users" table.
 * @param {object} input - contains input data for each column in "users" table
 * @return {Promise}
 */
function addUser(input){
    console.log('adduser:', input);
    assert(input, 'input must be specified!');
    assert(input.user_id, 'input.user_id must be specified!');
    assert(input.user_name, 'input.user_name must be specified!');
    assert(input.email, 'input.email must be specified!');
    assert(input.password, 'input.password must be specified!');

    let statement = `INSERT INTO users (user_id, user_name, email, password) ` + 
        `VALUES ("${input.user_id}", "${input.user_name}", "${input.email}", "${input.password}")`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO users');
}

/**
 * Search for a user by email in "users" table.
 * @param {String} email - the email to search by
 * @return {Promise}
 */
function findUserByEmail(email){
    assert(email, 'email must be specified!');
    
    let statement = `SELECT user_id, user_name, email, password FROM users WHERE email='${email}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM users');
}

/**
 * Search for a user by id in "users" table.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function findUserById(id){
    assert(id, 'id must be specified!');
    
    let statement = `SELECT user_id, user_name, email, password FROM users WHERE user_id='${id}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM users');
}

/**
 * Add entry to "meetings" table.
 * @param {object} input - contains input data for each column in "meetings" table
 * @return {Promise}
 */
function addMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meeting_id, 'input.meeting_id must be specified!');
    assert(input.meeting_name, 'input.meeting_name must be specified!');
    assert(input.description, 'input.description must be specified!');
    assert(input.initiated_by, 'input.initiated_by must be specified!');
    assert(input.proposed_dates_and_times, 'input.proposed_dates_and_times must be specified!');

    let statement = `INSERT INTO meetings (meeting_id, meeting_name, description, initiated_by, proposed_dates_and_times) ` +
        `VALUES ("${input.meeting_id}", "${input.meeting_name}", "${input.description}", "${input.initiated_by}", "${input.proposed_dates_and_times}")`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO meetings')
        .catch(handleError('ERROR [addMeeting]'));
}

/**
 * Add entry to "dates_and_times" table.
 * @param {object} input - contains input data for each column in "dates_and_times" table
 * @return {Promise}
 */
function addDatesAndTimes(input){
    assert(input, 'input must be specified!');
    assert(input.meeting_id, 'input.meeting_id must be specified!');
    assert(input.user_id, 'input.user_id must be specified!');
    assert(input.accepted_dates_and_times, 'input.accepted_dates_and_times must be specified!');

    let statement = `INSERT INTO dates_and_times (meeting_id, user_id, accepted_dates_and_times) ` +
        `VALUES ("${input.meeting_id}", "${input.user_id}", "${input.accepted_dates_and_times}")`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO dates_and_times')
        .catch(handleError('ERROR [addAcceptedTimes]'));
}

/**
 * Query "users" table on user_id.
 * @param {String} user_id
 * @return {object} - result of the query
 */
async function getUser(user_id){
    assert(user_id, 'user_id must be specified!');

    let result;
    let statement = `SELECT * FROM users WHERE user_id="${user_id}"`;
    await sqlite3_wrapper.getPromisified(statement, 'SELECT FROM users')
        .then((row)=>{ result = row; })
        .catch(handleError('ERROR [getUser]'));

    return result;
}

/**
 * Query "meetings" table on meeting_id.
 * @param {String} meeting_id
 * @return {object} - result of the query
 */
async function getMeeting(meeting_id){
    assert(meeting_id, 'meeting_id must be specified!');

    let result;
    let statement = `SELECT * FROM meetings WHERE meeting_id="${meeting_id}"`;

    await sqlite3_wrapper.getPromisified(statement, 'SELECT FROM meetings')
        .then((row)=>{ result = row; })
        .catch(handleError('ERROR [getMeeting]'));

    return result;
}

/**
 * Query "dates_and_times" table on meeting_id and user_id.
 * @param {String} meeting_id
 * @param {String} user_id
 * @return {object} - result of the query
 */
async function getDatesAndTimes(meeting_id, user_id){
    assert(meeting_id, 'meeting_id must be specified!');
    assert(user_id, 'user_id must be specified!');

    let result;
    let statement =`SELECT * FROM dates_and_times WHERE meeting_id="${meeting_id}" AND user_id="${user_id}"`;

    await sqlite3_wrapper.getPromisified(statement, 'SELECT FROM dates_and_times')
        .then((row)=>{ result = row; })
        .catch(handleError('ERROR [getAcceptedTimes]'));

    return result;
}

//=============================== API for NOT logged user ==========================================================

/**
 * Add entry to "other_meetings" table.
 * @param {object} input - contains input data for each column in "other_meetings" table
 * @return {Promise}
 */
function addOtherMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meeting_id, 'input.meeting_id must be specified!');
    assert(input.user_name , 'input.user_name must be specified!');
    assert(input.user_email , 'input.user_email must be specified!');
    assert(input.meeting_name , 'input.meeting_name must be specified!');
    assert(input.meeting_description , 'input.meeting_description must be specified!');
    assert(input.proposed_dates_and_times , 'input.proposed_dates_and_times must be specified!');
    assert(input.invite_emails , 'input.invite_emails  must be specified!');

    let statement = `INSERT INTO other_meetings (meeting_id, user_name, user_email, meeting_name, meeting_description, proposed_dates_and_times, invite_emails) ` +
        `VALUES ("${input.meeting_id}", "${input.user_name}", "${input.user_email}", "${input.meeting_name}", "${input.meeting_description}", "${input.proposed_dates_and_times}", "${input.invite_emails}")`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO other_meetings')
        .catch(handleError('ERROR [addOtherMeeting]'));
}

/**
 * Add entry to "other_dates_and_times" table.
 * @param {object} input - contains input data for each column in "other_dates_and_times" table
 * @return {Promise}
 */
function addOtherDatesAndTimes(input){
    assert(input, 'input must be specified!');
    assert(input.dates_and_times_id, 'input.dates_and_times_id must be specified!');
    assert(input.meeting_id , 'input.meeting_id must be specified!');
    assert(input.atendant_name , 'input.atendant_name must be specified!');
    assert(input.accepted_dates_and_times , 'input.accepted_dates_and_times must be specified!');

    let statement = `INSERT INTO other_dates_and_times (dates_and_times_id, meeting_id, atendant_name, accepted_dates_and_times) ` +
        `VALUES ("${input.dates_and_times_id}", "${input.meeting_id}", "${input.atendant_name}", "${input.accepted_dates_and_times}")`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO other_dates_and_times')
        .catch(handleError('ERROR [addOtherDatesAndTimes]'));
}

module.exports = { 
    openDatabase, 
    closeDatabase, 
    // API for logged user
    addUser, 
    findUserByEmail,
    findUserById,
    addMeeting, 
    addDatesAndTimes, 
    getUser, 
    getMeeting, 
    getDatesAndTimes,
    // API for NOT logged user
    addOtherMeeting,
    addOtherDatesAndTimes
};
