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
        .then(
            (result)=>{
                return createDatabase();
            }
        )
        .then(
            (result)=>{
                return integrityCheck();
            }
        )
        .catch(handleError('ERROR [openDatabase]'));
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
    const Users_SQL ='CREATE TABLE Users' +
        '(user_id TEXT PRIMARY KEY, user_name TEXT, email TEXT, password TEXT)';
    const Meetings_SQL ='CREATE TABLE Meetings' +
        '(meeting_id TEXT PRIMARY KEY, meeting_name TEXT, meeting_description TEXT, initiated_by INTEGER, proposed_dates_and_times TEXT, FOREIGN KEY(initiated_by) REFERENCES Users(user_id))';
    const Invitations_SQL ='CREATE TABLE Invitations' +
        '(invitation_id TEXT PRIMARY KEY, meeting_id TEXT, attendant_email TEXT, accepted_dates_and_times TEXT, FOREIGN KEY(meeting_id) REFERENCES Meetings(meeting_id))'; 

    const queryForUsers = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Users"';
    const queryForMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Meetings"';
    const queryForInvitations = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="Invitations"';

    const NonMemberMeetings_SQL ='CREATE TABLE NonMemberMeetings' +
        '(meetingId TEXT PRIMARY KEY, meetingName TEXT, meetingDescription TEXT, username TEXT, userEmail TEXT, proposedDatesAndTimes TEXT)';
    const NonMemberInvitations_SQL ='CREATE TABLE NonMemberInvitations' +
        '(invitationId TEXT PRIMARY KEY, meetingId TEXT, attendantEmail TEXT, acceptedDatesAndTimes TEXT, FOREIGN KEY(meetingId) REFERENCES NonMemberMeetings(meetingId))'; 

    const queryForNonMemberMeetings = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="NonMemberMeetings"';
    const queryForNonMemberInvitations = 'SELECT sql FROM sqlite_master WHERE type="table" AND name="NonMemberInvitations"';

    return sqlite3_wrapper.getPromisified(queryForUsers)
        .then(
            (result)=>{
                if(result && result.sql === Users_SQL){
                    console.log('[createDatabase] Table "Users" exists.');
                } else {
                    return sqlite3_wrapper.runPromisified(Users_SQL, 'Create table "Users".');
                }
            }
        )
        .then(
            (result)=>{
                return sqlite3_wrapper.getPromisified(queryForMeetings);
            }
        )
        .then(
            (result)=>{
                if(result && result.sql === Meetings_SQL){
                    console.log('[createDatabase] Table "Meetings" exists.');
                } else {
                    return sqlite3_wrapper.runPromisified(Meetings_SQL, 'Create table "Meetings".');
                }
            }
        )
        .then(
            (result)=>{
                return sqlite3_wrapper.getPromisified(queryForInvitations);
            }
        )
        .then(
            (result)=>{
                if(result && result.sql === Invitations_SQL){
                    console.log('[createDatabase] Table "Invitations" exists.');
                } else {
                    return sqlite3_wrapper.runPromisified(Invitations_SQL, 'Create table "Invitations".');
                }
            }
        )
        .then(
            (result)=>{
                return sqlite3_wrapper.getPromisified(queryForNonMemberMeetings);
            }
        )
        .then(
            (result)=>{
                if(result && result.sql === NonMemberMeetings_SQL){
                    console.log('[createDatabase] Table "NonMemberMeetings" exists.');
                } else {
                    return sqlite3_wrapper.runPromisified(NonMemberMeetings_SQL, 'Create table "NonMemberMeetings".');
                }
            }
        )
        .then(
            (result)=>{
                return sqlite3_wrapper.getPromisified(queryForNonMemberInvitations);
            }
        )
        .then(
            (result)=>{
                if(result && result.sql === NonMemberInvitations_SQL){
                    console.log('[createDatabase] Table "NonMemberInvitations" exists.');
                } else {
                    return sqlite3_wrapper.runPromisified(NonMemberInvitations_SQL, 'Create table "NonMemberInvitations".');
                }
            }
        )
        .catch(handleError('ERROR [createDatabase]'));
}

//=============================== Users ==========================================================

/**
 * Create user.
 * @param {object} input - contains input data for columns in "Users" table
 * @return {Promise}
 */
function createUser(input){
    console.log('createUser:', input);
    assert(input, 'input must be specified!');
    assert(input.user_id, 'input.user_id must be specified!');
    assert(input.user_name, 'input.user_name must be specified!');
    assert(input.email, 'input.email must be specified!');

    let statement = `INSERT INTO Users (user_id, user_name, email, password) ` + 
        `VALUES ('${input.user_id}', '${input.user_name}', '${input.email}', '${input.password}')`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO Users');
}

/**
 * Get all users.
 * @return {Promise}
 */
function getAllUsers(){
    let statement = `SELECT user_id, user_name, email FROM Users`;
    return sqlite3_wrapper.allPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete all users.
 * @return {Promise}
 */
function deleteAllUsers(){
    let statement = `DELETE FROM Users`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Get user by email.
 * @param {String} email - the email to search by
 * @return {Promise}
 */
function getUserByEmail(email){
    assert(email, 'email must be specified!');

    let statement = `SELECT user_id, user_name, email, password FROM Users WHERE email='${email}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Get user by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getUserById(id){
    assert(id, 'id must be specified!');

    let statement = `SELECT user_id, user_name, email, password FROM Users WHERE user_id='${id}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete user.
 * @param {String} id - the id of the user to be deleted 
 * @return {Promise}
 */
function deleteUser(id){
    let statement = `DELETE FROM Users WHERE user_id='${id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Update user.
 * @param {String} input - contains update user data
 * @return {Promise}
 */
function updateUser(input){
    assert(input, 'input must be specified!');
    assert(input.user_id, 'input.user_id must be specified!');

    let fields = new Array();

    if(input.user_name){
        fields[fields.length] = `user_name='${input.user_name}'`;
    }
    if(input.email){
        fields[fields.length] = `email='${input.email}'`;
    }
    if(input.user_name){
        fields[fields.length] = `password='${input.password}'`;
    }

    let statement = `UPDATE Users SET ${fields.join(', ')} WHERE user_id='${input.user_id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'UPDATE Users');
}


//=============================== Meetings ==========================================================

/**
 * Create meeting.
 * @param {object} input - contains input data for columns in "Meetings" table
 * @return {Promise}
 */
function createMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meeting_id, 'input.meeting_id must be specified!');
    assert(input.meeting_name, 'input.meeting_name must be specified!');
    // meeting description is optional
    // assert(input.meeting_description, 'input.meeting_description must be specified!');
    assert(input.initiated_by, 'input.initiated_by must be specified!');
    assert(input.proposed_dates_and_times, 'input.proposed_dates_and_times must be specified!');

    let statement = `INSERT INTO Meetings (meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times) ` +
        `VALUES ('${input.meeting_id}', '${input.meeting_name}', '${input.meeting_description}', '${input.initiated_by}', '${input.proposed_dates_and_times}')`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO Meetings');
}

/**
 * Get all meetings.
 * @return {Promise}
 */
function getAllMeetings(){
    let statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings`;
    return sqlite3_wrapper.allPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete all meetings.
 * @return {Promise}
 */
function deleteAllMeetings(){
    let statement = `DELETE FROM Meetings`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Get meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getMeetingById(id){
    assert(id, 'id must be specified!');

    let statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings WHERE meeting_id='${id}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete meeting.
 * @param {String} id - the id of the meeting to be deleted 
 * @return {Promise}
 */
function deleteMeeting(id){
    let statement = `DELETE FROM Meetings WHERE meeting_id='${id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Update meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
function updateMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meeting_id, 'input.meeting_id must be specified!');

    let fields = new Array();

    if(input.meeting_name){
        fields[fields.length] = `meeting_name='${input.meeting_name}'`;
    }
    if(input.meeting_description){
        fields[fields.length] = `meeting_description='${input.meeting_description}'`;
    }
    if(input.initiated_by){
        fields[fields.length] = `initiated_by='${input.initiated_by}'`;
    }
    if(input.proposed_dates_and_times){
        fields[fields.length] = `proposed_dates_and_times='${input.proposed_dates_and_times}'`;
    }

    let statement = `UPDATE Meetings SET ${fields.join(', ')} WHERE meeting_id='${input.meeting_id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'UPDATE Meetings');
}

//=============================== Invitations ==========================================================

/**
 * Create meeting invitation.
 * @param {object} input - contains input data for columns in "Invitations" table
 * @return {Promise}
 */
function createInvitation(input){
    assert(input, 'input must be specified!');
    assert(input.invitation_id, 'input.invitation_id must be specified!');
    assert(input.meeting_id , 'input.meeting_id must be specified!');
    assert(input.attendant_email , 'input.attendant_email must be specified!');
    assert(input.accepted_dates_and_times , 'input.accepted_dates_and_times must be specified!');


    let statement = `INSERT INTO Invitations (invitation_id, meeting_id, attendant_email, accepted_dates_and_times) ` +
        `VALUES ('${input.invitation_id}', '${input.meeting_id}', '${input.attendant_email}', '${input.accepted_dates_and_times}')`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO Invitations');
}

/**
 * Get all meeting invitations.
 * @return {Promise}
 */
function getAllInvitations(){
    let statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations`;
    return sqlite3_wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Get all meeting invitations.
 * @return {Promise}
 */
function getInvitationsByMeetingId(meetingId){
    assert(meetingId, 'meetingId must be specified!');

    let statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations where meeting_id='${meetingId}'`;

    return sqlite3_wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete all meeting invitations.
 * @return {Promise}
 */
function deleteAllInvitations(){
    let statement = `DELETE FROM Invitations`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Get meeting invitation by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getInvitationById(id){
    assert(id, 'id must be specified!');

    let statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations WHERE invitation_id='${id}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete meeting invitation.
 * @param {String} id - the id of the meeting invitation to be deleted 
 * @return {Promise}
 */
function deleteInvitation(id){
    let statement = `DELETE FROM Invitations WHERE invitation_id='${id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Update meeting invitation.
 * @param {String} input - contains update meeting invitation data
 * @return {Promise}
 */
function updateInvitation(input){
    assert(input, 'input must be specified!');
    assert(input.invitation_id, 'input.invitation_id must be specified!');

    let fields = new Array();

    if(input.meeting_id){
        fields[fields.length] = `meeting_id='${input.meeting_id}'`;
    }
    if(input.attendant_email){
        fields[fields.length] = `attendant_email='${input.attendant_email}'`;
    }
    if(input.accepted_dates_and_times){
        fields[fields.length] = `accepted_dates_and_times='${input.accepted_dates_and_times}'`;
    }

    let statement = `UPDATE Invitations SET ${fields.join(', ')} WHERE invitation_id='${input.invitation_id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'UPDATE Invitations');
}

//===================================== NonMemberMeetings =======================================================

/**
 * Create non member meeting.
 * @param {object} input - contains input data for columns in "NonMemberMeetings" table
 * @return {Promise}
 */
function createNonMemberMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meetingId, 'input.meetingId must be specified!');
    assert(input.meetingName, 'input.meetingName must be specified!');
    // meeting description is optional
    // assert(input.meetingDescription, 'input.meetingDescription must be specified!');
    assert(input.username, 'input.username must be specified!');
    assert(input.userEmail, 'input.userEmail must be specified!');
    assert(input.proposedDatesAndTimes, 'input.proposedDatesAndTimes must be specified!');

    let statement = `INSERT INTO NonMemberMeetings (meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes) ` +
        `VALUES ('${input.meetingId}', '${input.meetingName}', '${input.meetingDescription}', '${input.username}', '${input.userEmail}', '${input.proposedDatesAndTimes}')`;

    return sqlite3_wrapper.runPromisified(statement, 'INSERT INTO NonMemberMeetings');
}

/**
 * Get all non member meetings.
 * @return {Promise}
 */
function getAllNonMemberMeetings(){
    let statement = `SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings`;
    return sqlite3_wrapper.allPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete all non member meetings.
 * @return {Promise}
 */
function deleteAllNonMemberMeetings(){
    let statement = `DELETE FROM NonMemberMeetings`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Get non member meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
function getNonMemberMeetingById(id){
    assert(id, 'id must be specified!');

    let statement = `SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings WHERE meetingId='${id}'`;

    return sqlite3_wrapper.getPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete non member meeting.
 * @param {String} id - the id of the meeting to be deleted 
 * @return {Promise}
 */
function deleteNonMemberMeeting(id){
    let statement = `DELETE FROM NonMemberMeetings WHERE meetingId='${id}'`;
    return sqlite3_wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Update non member meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
function updateNonMemberMeeting(input){
    assert(input, 'input must be specified!');
    assert(input.meetingId, 'input.meetingId must be specified!');

    let fields = new Array();

    if(input.meetingName){
        fields[fields.length] = `meetingName='${input.meetingName}'`;
    }
    if(input.meeting_description){
        fields[fields.length] = `meetingDescription='${input.meetingDescription}'`;
    }
    if(input.username){
        fields[fields.length] = `username='${input.username}'`;
    }
    if(input.userEmail){
        fields[fields.length] = `userEmail='${input.userEmail}'`;
    }
    if(input.proposedDatesAndTimes){
        fields[fields.length] = `proposedDatesAndTimes='${input.proposedDatesAndTimes}'`;
    }

    let statement = `UPDATE NonMemberMeetings SET ${fields.join(', ')} WHERE meetingId='${input.meetingId}'`;
    return sqlite3_wrapper.runPromisified(statement, 'UPDATE NonMemberMeetings');
}

//===============================================================================================================

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
    deleteAllMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,

    // Invitations 
    createInvitation, 
    getAllInvitations,
    getInvitationsByMeetingId,
    deleteAllInvitations,
    getInvitationById,
    updateInvitation,
    deleteInvitation, 

    // NonMemberMeetings
    createNonMemberMeeting, 
    getAllNonMemberMeetings,
    deleteAllNonMemberMeetings,
    getNonMemberMeetingById,
    deleteNonMemberMeeting,
    updateNonMemberMeeting
};
