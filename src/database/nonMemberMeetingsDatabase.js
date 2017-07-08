import assert from 'assert';
import sqlite3Wrapper from './sqlite3Wrapper';

/**
 * Create non member meeting.
 * @param {object} input - contains input data for columns in "NonMemberMeetings" table
 * @return {Promise}
 */
export function createNonMemberMeeting(input) {
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
export function getAllNonMemberMeetings() {
  const statement = 'SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete all non member meetings.
 * @return {Promise}
 */
export function deleteAllNonMemberMeetings() {
  const statement = 'DELETE FROM NonMemberMeetings';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Get non member meeting by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
export function getNonMemberMeetingById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT meetingId, meetingName, meetingDescription, username, userEmail, proposedDatesAndTimes FROM NonMemberMeetings WHERE meetingId='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM NonMemberMeetings');
}

/**
 * Delete non member meeting.
 * @param {String} id - the id of the meeting to be deleted
 * @return {Promise}
 */
export function deleteNonMemberMeeting(id) {
  const statement = `DELETE FROM NonMemberMeetings WHERE meetingId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberMeetings');
}

/**
 * Update non member meeting.
 * @param {String} input - contains update meeting data
 * @return {Promise}
 */
export function updateNonMemberMeeting(input) {
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

export default {
  createNonMemberMeeting,
  getAllNonMemberMeetings,
  deleteAllNonMemberMeetings,
  getNonMemberMeetingById,
  deleteNonMemberMeeting,
  updateNonMemberMeeting,
};
