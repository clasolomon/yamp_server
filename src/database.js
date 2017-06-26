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
import sqlite3Wrapper from './sqlite3_wrapper';

const debug = _debug('database:database');

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

//= ============================== Users ==========================================================

/**
 * Create user.
 * @param {object} input - contains input data for columns in "Users" table
 * @return {Promise}
 */
function createUser(input) {
  debug('createUser:', input);
  assert(input, 'input must be specified!');
  assert(input.user_id, 'input.user_id must be specified!');
  assert(input.user_name, 'input.user_name must be specified!');
  assert(input.email, 'input.email must be specified!');

  const statement = 'INSERT INTO Users (user_id, user_name, email, password) ' +
        `VALUES ('${input.user_id}', '${input.user_name}', '${input.email}', '${input.password}')`;

  return sqlite3Wrapper.runPromisified(statement, 'INSERT INTO Users');
}

/**
 * Get all users.
 * @return {Promise}
 */
function getAllUsers() {
  const statement = 'SELECT user_id, user_name, email FROM Users';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete all users.
 * @return {Promise}
 */
function deleteAllUsers() {
  const statement = 'DELETE FROM Users';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Get user by email.
 * @param {String} email - the email to search by
 * @return {Promise}
 */
function getUserByEmail(email) {
  assert(email, 'email must be specified!');

  const statement = `SELECT user_id, user_name, email, password FROM Users WHERE email='${email}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Get user by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getUserById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT user_id, user_name, email, password FROM Users WHERE user_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete user.
 * @param {String} id - the id of the user to be deleted
 * @return {Promise}
 */
function deleteUser(id) {
  const statement = `DELETE FROM Users WHERE user_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Update user.
 * @param {String} input - contains update user data
 * @return {Promise}
 */
function updateUser(input) {
  assert(input, 'input must be specified!');
  assert(input.user_id, 'input.user_id must be specified!');

  const fields = [];

  if (input.user_name) {
    fields[fields.length] = `user_name='${input.user_name}'`;
  }
  if (input.email) {
    fields[fields.length] = `email='${input.email}'`;
  }
  if (input.user_name) {
    fields[fields.length] = `password='${input.password}'`;
  }

  const statement = `UPDATE Users SET ${fields.join(', ')} WHERE user_id='${input.user_id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE Users');
}


//= ================ Meetings =====================

/**
 * Create meeting.
 * @param {object} input - contains input data for columns in "Meetings" table
 * @return {Promise}
 */
function createMeeting(input) {
  assert(input, 'input must be specified!');
  assert(input.meeting_id, 'input.meeting_id must be specified!');
  assert(input.meeting_name, 'input.meeting_name must be specified!');
    // meeting description is optional
    // assert(input.meeting_description, 'input.meeting_description must be specified!');
  assert(input.initiated_by, 'input.initiated_by must be specified!');
  assert(input.proposed_dates_and_times, 'input.proposed_dates_and_times must be specified!');

  const statement = 'INSERT INTO Meetings (meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times) ' +
        `VALUES ('${input.meeting_id}', '${input.meeting_name}', '${input.meeting_description}', '${input.initiated_by}', '${input.proposed_dates_and_times}')`;

  return sqlite3Wrapper.runPromisified(statement, 'INSERT INTO Meetings');
}

/**
 * Get all meetings.
 * @return {Promise}
 */
function getAllMeetings() {
  const statement = 'SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Get all meetings initiated by a member.
 * @return {Promise}
 */
function getAllMeetingsByUserId(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings WHERE initiated_by='${id}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete all meetings.
 * @return {Promise}
 */
function deleteAllMeetings() {
  const statement = 'DELETE FROM Meetings';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Delete all meetings by user_id.
 * @param {String} id - the id of the user who initiated the meeting
 * @return {Promise}
 */
function deleteAllMeetingsByUserId(id) {
  assert(id, 'id must be specified!');

  const statement = `DELETE FROM Meetings WHERE initiated_by='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Get meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getMeetingById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings WHERE meeting_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete meeting.
 * @param {String} id - the id of the meeting to be deleted
 * @return {Promise}
 */
function deleteMeeting(id) {
  assert(id, 'id must be specified!');

  const statement = `DELETE FROM Meetings WHERE meeting_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Update meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
function updateMeeting(input) {
  assert(input, 'input must be specified!');
  assert(input.meeting_id, 'input.meeting_id must be specified!');

  const fields = [];

  if (input.meeting_name) {
    fields[fields.length] = `meeting_name='${input.meeting_name}'`;
  }
  if (input.meeting_description) {
    fields[fields.length] = `meeting_description='${input.meeting_description}'`;
  }
  if (input.initiated_by) {
    fields[fields.length] = `initiated_by='${input.initiated_by}'`;
  }
  if (input.proposed_dates_and_times) {
    fields[fields.length] = `proposed_dates_and_times='${input.proposed_dates_and_times}'`;
  }

  const statement = `UPDATE Meetings SET ${fields.join(', ')} WHERE meeting_id='${input.meeting_id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE Meetings');
}

//= ================= Invitations =======================

/**
 * Create meeting invitation.
 * @param {object} input - contains input data for columns in "Invitations" table
 * @return {Promise}
 */
function createInvitation(input) {
  assert(input, 'input must be specified!');
  assert(input.invitation_id, 'input.invitation_id must be specified!');
  assert(input.meeting_id, 'input.meeting_id must be specified!');
  assert(input.attendant_email, 'input.attendant_email must be specified!');
  assert(input.accepted_dates_and_times, 'input.accepted_dates_and_times must be specified!');


  const statement = 'INSERT INTO Invitations (invitation_id, meeting_id, attendant_email, accepted_dates_and_times) ' +
        `VALUES ('${input.invitation_id}', '${input.meeting_id}', '${input.attendant_email}', '${input.accepted_dates_and_times}')`;

  return sqlite3Wrapper.runPromisified(statement, 'INSERT INTO Invitations');
}

/**
 * Get all meeting invitations.
 * @return {Promise}
 */
function getAllInvitations() {
  const statement = 'SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Get all meeting invitations.
 * @return {Promise}
 */
function getInvitationsByMeetingId(meetingId) {
  assert(meetingId, 'meetingId must be specified!');

  const statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations where meeting_id='${meetingId}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete all meeting invitations.
 * @return {Promise}
 */
function deleteAllInvitations() {
  const statement = 'DELETE FROM Invitations';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Delete all meeting invitations with a certain meeting_id.
 * @param {String} id - the meeting_id
 * @return {Promise}
 */
function deleteAllInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');
  const statement = `DELETE FROM Invitations WHERE meeting_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Get meeting invitation by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getInvitationById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations WHERE invitation_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete meeting invitation.
 * @param {String} id - the id of the meeting invitation to be deleted
 * @return {Promise}
 */
function deleteInvitation(id) {
  const statement = `DELETE FROM Invitations WHERE invitation_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Update meeting invitation.
 * @param {String} input - contains update meeting invitation data
 * @return {Promise}
 */
function updateInvitation(input) {
  assert(input, 'input must be specified!');
  assert(input.invitation_id, 'input.invitation_id must be specified!');

  const fields = [];

  if (input.meeting_id) {
    fields[fields.length] = `meeting_id='${input.meeting_id}'`;
  }
  if (input.attendant_email) {
    fields[fields.length] = `attendant_email='${input.attendant_email}'`;
  }
  if (input.accepted_dates_and_times) {
    fields[fields.length] = `accepted_dates_and_times='${input.accepted_dates_and_times}'`;
  }

  const statement = `UPDATE Invitations SET ${fields.join(', ')} WHERE invitation_id='${input.invitation_id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE Invitations');
}

//= =================== NonMemberMeetings ========================

/**
 * Create non member meeting.
 * @param {object} input - contains input data for columns in "NonMemberMeetings" table
 * @return {Promise}
 */
function createNonMemberMeeting(input) {
  assert(input, 'input must be specified!');
  assert(input.meetingId, 'input.meetingId must be specified!');
  assert(input.meetingName, 'input.meetingName must be specified!');
    // meeting description is optional
    // assert(input.meetingDescription, 'input.meetingDescription must be specified!');
  assert(input.username, 'input.username must be specified!');
  assert(input.userEmail, 'input.userEmail must be specified!');
  assert(input.proposedDatesAndTimes, 'input.proposedDatesAndTimes must be specified!');

  const statement = 'INSERT INTO NonMemberMeetings (meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes) ' +
        `VALUES ('${input.meetingId}', '${input.meetingName}', '${input.meetingDescription}', '${input.username}', '${input.userEmail}', '${input.proposedDatesAndTimes}')`;

  return sqlite3Wrapper.runPromisified(statement, 'INSERT INTO NonMemberMeetings');
}

/**
 * Get all non member meetings.
 * @return {Promise}
 */
function getAllNonMemberMeetings() {
  const statement = 'SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete all non member meetings.
 * @return {Promise}
 */
function deleteAllNonMemberMeetings() {
  const statement = 'DELETE FROM NonMemberMeetings';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Get non member meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getNonMemberMeetingById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings WHERE meetingId='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete non member meeting.
 * @param {String} id - the id of the meeting to be deleted
 * @return {Promise}
 */
function deleteNonMemberMeeting(id) {
  const statement = `DELETE FROM NonMemberMeetings WHERE meetingId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Update non member meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
function updateNonMemberMeeting(input) {
  assert(input, 'input must be specified!');
  assert(input.meetingId, 'input.meetingId must be specified!');

  const fields = [];

  if (input.meetingName) {
    fields[fields.length] = `meetingName='${input.meetingName}'`;
  }
  if (input.meeting_description) {
    fields[fields.length] = `meetingDescription='${input.meetingDescription}'`;
  }
  if (input.username) {
    fields[fields.length] = `username='${input.username}'`;
  }
  if (input.userEmail) {
    fields[fields.length] = `userEmail='${input.userEmail}'`;
  }
  if (input.proposedDatesAndTimes) {
    fields[fields.length] = `proposedDatesAndTimes='${input.proposedDatesAndTimes}'`;
  }

  const statement = `UPDATE NonMemberMeetings SET ${fields.join(', ')} WHERE meetingId='${input.meetingId}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE NonMemberMeetings');
}
//= ===================== NonMemberInvitations ===========================

/**
 * Create non member meeting invitation.
 * @param {object} input - contains input data for columns in "Invitations" table
 * @return {Promise}
 */
function createNonMemberInvitation(input) {
  assert(input, 'input must be specified!');
  assert(input.invitationId, 'input.invitationId must be specified!');
  assert(input.meetingId, 'input.meetingId must be specified!');
  assert(input.attendantEmail, 'input.attendantEmail must be specified!');
  assert(input.acceptedDatesAndTimes, 'input.acceptedDatesAndTimes must be specified!');


  const statement = 'INSERT INTO NonMemberInvitations (invitationId, meetingId, attendantEmail, acceptedDatesAndTimes) ' +
        `VALUES ('${input.invitationId}', '${input.meetingId}', '${input.attendantEmail}', '${input.acceptedDatesAndTimes}')`;

  return sqlite3Wrapper.runPromisified(statement, 'INSERT INTO NonMemberInvitations');
}

/**
 * Get all non member meeting invitations.
 * @return {Promise}
 */
function getAllNonMemberInvitations() {
  const statement = 'SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Get all non member meeting invitations.
 * @return {Promise}
 */
function getNonMemberInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations where meetingId='${id}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Delete all non member meeting invitations.
 * @return {Promise}
 */
function deleteAllNonMemberInvitations() {
  const statement = 'DELETE FROM NonMemberInvitations';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Delete all non member meeting invitations with a certain meetingId.
 * @param {String} id - the meetingId
 * @return {Promise}
 */
function deleteAllNonMemberInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');
  const statement = `DELETE FROM NonMemberInvitations WHERE meetingId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Get non member meeting invitation by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getNonMemberInvitationById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations WHERE invitationId='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Delete non member meeting invitation.
 * @param {String} id - the id of the non member meeting invitation to be deleted
 * @return {Promise}
 */
function deleteNonMemberInvitation(id) {
  const statement = `DELETE FROM NonMemberInvitations WHERE invitationId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Update non member meeting invitation.
 * @param {String} input - contains update non member meeting invitation data
 * @return {Promise}
 */
function updateNonMemberInvitation(input) {
  assert(input, 'input must be specified!');
  assert(input.invitationId, 'input.invitationId must be specified!');

  const fields = [];

  if (input.meetingId) {
    fields[fields.length] = `meetingId='${input.meetingId}'`;
  }
  if (input.attendantEmail) {
    fields[fields.length] = `attendantEmail='${input.attendantEmail}'`;
  }
  if (input.acceptedDatesAndTimes) {
    fields[fields.length] = `acceptedDatesAndTimes='${input.acceptedDatesAndTimes}'`;
  }

  const statement = `UPDATE NonMemberInvitations SET ${fields.join(', ')} WHERE invitationId='${input.invitationId}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE NonMemberInvitations');
}

//= ==========================================================

module.exports = {
  openDatabase,
  closeDatabase,

    // Users
  createUser,
  getAllUsers,
  deleteAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,

    // Meetings
  createMeeting,
  getAllMeetings,
  getAllMeetingsByUserId,
  deleteAllMeetings,
  deleteAllMeetingsByUserId,
  getMeetingById,
  updateMeeting,
  deleteMeeting,

    // Invitations
  createInvitation,
  getAllInvitations,
  getInvitationsByMeetingId,
  deleteAllInvitations,
  deleteAllInvitationsByMeetingId,
  getInvitationById,
  updateInvitation,
  deleteInvitation,

    // NonMemberMeetings
  createNonMemberMeeting,
  getAllNonMemberMeetings,
  deleteAllNonMemberMeetings,
  getNonMemberMeetingById,
  deleteNonMemberMeeting,
  updateNonMemberMeeting,

    // NonMemberInvitations
  createNonMemberInvitation,
  getAllNonMemberInvitations,
  getNonMemberInvitationsByMeetingId,
  deleteAllNonMemberInvitations,
  deleteAllNonMemberInvitationsByMeetingId,
  getNonMemberInvitationById,
  deleteNonMemberInvitation,
  updateNonMemberInvitation,
};
