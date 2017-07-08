import assert from 'assert';
import sqlite3Wrapper from './sqlite3Wrapper';

/**
 * Create non member meeting invitation.
 * @param {object} input - contains input data for columns in "Invitations" table
 * @return {Promise}
 */
export function createNonMemberInvitation(input) {
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
export function getAllNonMemberInvitations() {
  const statement = 'SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Get all non member meeting invitations.
 * @return {Promise}
 */
export function getNonMemberInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations where meetingId='${id}'`;

  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Delete all non member meeting invitations.
 * @return {Promise}
 */
export function deleteAllNonMemberInvitations() {
  const statement = 'DELETE FROM NonMemberInvitations';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Delete all non member meeting invitations with a certain meetingId.
 * @param {String} id - the meetingId
 * @return {Promise}
 */
export function deleteAllNonMemberInvitationsByMeetingId(id) {
  assert(id, 'id must be specified!');
  const statement = `DELETE FROM NonMemberInvitations WHERE meetingId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Get non member meeting invitation by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
export function getNonMemberInvitationById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT invitationId, meetingId, attendantEmail, acceptedDatesAndTimes FROM NonMemberInvitations WHERE invitationId='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM NonMemberInvitations');
}

/**
 * Delete non member meeting invitation.
 * @param {String} id - the id of the non member meeting invitation to be deleted
 * @return {Promise}
 */
export function deleteNonMemberInvitation(id) {
  const statement = `DELETE FROM NonMemberInvitations WHERE invitationId='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM NonMemberInvitations');
}

/**
 * Update non member meeting invitation.
 * @param {String} input - contains update non member meeting invitation data
 * @return {Promise}
 */
export function updateNonMemberInvitation(input) {
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

export default {
  createNonMemberInvitation,
  getAllNonMemberInvitations,
  getNonMemberInvitationsByMeetingId,
  deleteAllNonMemberInvitations,
  deleteAllNonMemberInvitationsByMeetingId,
  getNonMemberInvitationById,
  deleteNonMemberInvitation,
  updateNonMemberInvitation,
};
