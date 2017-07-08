/**
 * Provide the database API layer.
 * @module database
 */

/**
 * Module dependencies.
 */
import path from 'path';
import _debug from 'debug';
import assert from 'assert';
import sqlite3Wrapper from './sqlite3Wrapper';

const debug = _debug('database:databaseSetup');

/** Hold the database fullname (path/name) */
let databaseFullName;

/**
 * Log message and error.
 *
 * @param {String} errMessage - Message to describe the last database operation
 * @return {Function}
 * @throws {Error}
 */
function handleError(errMessage) {
  return (err) => {
    debug(errMessage, err);
    throw err;
  };
}

/**
 * Close database connection.
 * @return undefined
 */
async function closeDatabase() {
  await sqlite3Wrapper.closeConnection(databaseFullName)
        .catch(handleError('ERROR [closeDatabase]'));
}

/**
 * Check the integrity of the database.
 * @return {Promise}
 */
function integrityCheck() {
  return sqlite3Wrapper.allPromisified('PRAGMA integrity_check')
        .then(
            (result) => {
              if (result.length !== 1 || result[0].integrity_check !== 'ok') {
                debug('[integrityCheck] INTEGRITY CHECK ERRORS:', result);
                throw new Error('database integrity check');
              }
            },
        )
        .then(
            () => sqlite3Wrapper.allPromisified('PRAGMA foreign_key_check')).then((result) => {
              if (result.length !== 0) {
                debug('[integrityCheck] FOREIGN KEY ERRORS:', result);
                throw new Error('foreign key integrity check');
              }
            },
            )
        .catch(handleError('ERROR [integrityCheck]'));
}

/**
 * Create the database.
 * Checks first if the table exists in the database and creates it only if it doesn't exist.
 * @return {Promise}
 */
function createDatabase() {
    // tables used when user is logged in
  const UsersSQL = 'CREATE TABLE Users' +
        '(user_id TEXT PRIMARY KEY, user_name TEXT, email TEXT, password TEXT)';
  const MeetingsSQL = 'CREATE TABLE Meetings' +
        '(meeting_id TEXT PRIMARY KEY, meeting_name TEXT, meeting_description TEXT, initiated_by INTEGER, proposed_dates_and_times TEXT, FOREIGN KEY(initiated_by) REFERENCES Users(user_id))';
  const InvitationsSQL = 'CREATE TABLE Invitations' +
        '(invitation_id TEXT PRIMARY KEY, meeting_id TEXT, attendant_email TEXT, accepted_dates_and_times TEXT, FOREIGN KEY(meeting_id) REFERENCES Meetings(meeting_id))';

  const queryForUsers = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Users"';
  const queryForMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Meetings"';
  const queryForInvitations = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Invitations"';

  const NonMemberMeetingsSQL = 'CREATE TABLE NonMemberMeetings' +
        '(meetingId TEXT PRIMARY KEY, meetingName TEXT, meetingDescription TEXT, username TEXT, userEmail TEXT, proposedDatesAndTimes TEXT)';
  const NonMemberInvitationsSQL = 'CREATE TABLE NonMemberInvitations' +
        '(invitationId TEXT PRIMARY KEY, meetingId TEXT, attendantEmail TEXT, acceptedDatesAndTimes TEXT, FOREIGN KEY(meetingId) REFERENCES NonMemberMeetings(meetingId))';

  const queryForNonMemberMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="NonMemberMeetings"';
  const queryForNonMemberInvitations = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="NonMemberInvitations"';

  return sqlite3Wrapper.getPromisified(queryForUsers)
        .then(
            (result) => {
              let aPromise = null;
              if (result && result.sql === UsersSQL) {
                debug('[createDatabase] Table "Meetings" exists.');
              } else {
                aPromise = sqlite3Wrapper.runPromisified(UsersSQL, 'Create table "Users".');
              }
              return aPromise;
            },
        )
        .then(
            () => sqlite3Wrapper.getPromisified(queryForMeetings),
        )
        .then(
            (result) => {
              let aPromise = null;
              if (result && result.sql === MeetingsSQL) {
                debug('[createDatabase] Table "Meetings" exists.');
              } else {
                aPromise = sqlite3Wrapper.runPromisified(MeetingsSQL, 'Create table "Meetings".');
              }
              return aPromise;
            },
        )
        .then(
            () => sqlite3Wrapper.getPromisified(queryForInvitations),
        )
        .then(
            (result) => {
              let aPromise = null;
              if (result && result.sql === InvitationsSQL) {
                debug('[createDatabase] Table "Invitations" exists.');
              } else {
                aPromise = sqlite3Wrapper.runPromisified(InvitationsSQL, 'Create table "Invitations".');
              }
              return aPromise;
            },
        )
        .then(
            () => sqlite3Wrapper.getPromisified(queryForNonMemberMeetings),
        )
        .then(
            (result) => {
              let aPromise = null;
              if (result && result.sql === NonMemberMeetingsSQL) {
                debug('[createDatabase] Table "NonMemberMeetings" exists.');
              } else {
                aPromise = sqlite3Wrapper.runPromisified(NonMemberMeetingsSQL, 'Create table "NonMemberMeetings".');
              }
              return aPromise;
            },
        )
        .then(
            () => sqlite3Wrapper.getPromisified(queryForNonMemberInvitations),
        )
        .then(
            (result) => {
              let aPromise = null;
              if (result && result.sql === NonMemberInvitationsSQL) {
                debug('[createDatabase] Table "NonMemberInvitations" exists.');
              } else {
                aPromise = sqlite3Wrapper.runPromisified(NonMemberInvitationsSQL, 'Create table "NonMemberInvitations".');
              }
              return aPromise;
            },
        )
        .catch(handleError('ERROR [createDatabase]'));
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
async function openDatabase(databasePath, databaseName) {
  assert(databasePath, 'Database path must be specified!');
  assert(databaseName, 'Database name must be specified!');
  databaseFullName = path.join(databasePath, databaseName);

  await sqlite3Wrapper.getConnection(databaseFullName)
        .then(
            () => createDatabase(),
        )
        .then(
            () => integrityCheck(),
        )
        .catch(handleError('ERROR [openDatabase]'));
}

export default {
  openDatabase,
  closeDatabase,
};
