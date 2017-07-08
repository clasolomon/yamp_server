import assert from 'assert';
import sqlite3Wrapper from './sqlite3Wrapper';

/**
 * Create meeting invitation.
 * @param {object} input - contains input data for columns in "Invitations" table
 * @return {Promise}
 */
export function createInvitation(input) {
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
export function getAllInvitations() {
  const statement = 'SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Get all meeting invitations.
 * @return {Promise}
 */
export function getInvitationsByMeetingId(meetingId) {
  assert(meetingId, 'meetingId must be specified!');

  const statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations where meeting_id='${meetingId}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete all meeting invitations.
 * @return {Promise}
 */
export function deleteAllInvitations() {
  const statement = 'DELETE FROM Invitations';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Delete all meeting invitations with a certain meeting_id.
 * @param {String} id - the meeting_id
 * @return {Promise}
 */
export function deleteAllInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');
  const statement = `DELETE FROM Invitations WHERE meeting_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Get meeting invitation by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
export function getInvitationById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitation_id, meeting_id, attendant_email, accepted_dates_and_times FROM Invitations WHERE invitation_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Invitations');
}

/**
 * Delete meeting invitation.
 * @param {String} id - the id of the meeting invitation to be deleted
 * @return {Promise}
 */
export function deleteInvitation(id) {
  const statement = `DELETE FROM Invitations WHERE invitation_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Invitations');
}

/**
 * Update meeting invitation.
 * @param {String} input - contains update meeting invitation data
 * @return {Promise}
 */
export function updateInvitation(input) {
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

export default {
  createInvitation,
  getAllInvitations,
  getInvitationsByMeetingId,
  deleteAllInvitations,
  deleteAllInvitationsByMeetingId,
  getInvitationById,
  updateInvitation,
  deleteInvitation,
};
