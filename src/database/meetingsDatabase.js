import assert from 'assert';
import sqlite3Wrapper from './sqlite3Wrapper';

/**
 * Create meeting.
 * @param {object} input - contains input data for columns in "Meetings" table
 * @return {Promise}
 */
export function createMeeting(input) {
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
export function getAllMeetings() {
  const statement = 'SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Get all meetings initiated by a member.
 * @return {Promise}
 */
export function getAllMeetingsByUserId(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings WHERE initiated_by='${id}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete all meetings.
 * @return {Promise}
 */
export function deleteAllMeetings() {
  const statement = 'DELETE FROM Meetings';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Delete all meetings by user_id.
 * @param {String} id - the id of the user who initiated the meeting
 * @return {Promise}
 */
export function deleteAllMeetingsByUserId(id) {
  assert(id, 'id must be specified!');

  const statement = `DELETE FROM Meetings WHERE initiated_by='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Get meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
export function getMeetingById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meeting_id, meeting_name, meeting_description, initiated_by, proposed_dates_and_times FROM Meetings WHERE meeting_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Meetings');
}

/**
 * Delete meeting.
 * @param {String} id - the id of the meeting to be deleted
 * @return {Promise}
 */
export function deleteMeeting(id) {
  assert(id, 'id must be specified!');

  const statement = `DELETE FROM Meetings WHERE meeting_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Meetings');
}

/**
 * Update meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
export function updateMeeting(input) {
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

export default {
  createMeeting,
  getAllMeetings,
  getAllMeetingsByUserId,
  deleteAllMeetings,
  deleteAllMeetingsByUserId,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};
