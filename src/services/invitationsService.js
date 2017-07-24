import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';
import NotFoundError from '../customErrors/NotFoundError';
import InvalidInputError from '../customErrors/InvalidInputError';

const debug = _debug('services:invitationsService');

async function create(input) {
  debug('[create]');
  let invitationFromDatabase;

  if (typeof input.meetingId === 'undefined') {
    throw new InvalidInputError('meetingId is not defined!');
  }

  if (typeof input.attendantEmail === 'undefined') {
    throw new InvalidInputError('attendantEmail is not defined!');
  }

  if (typeof input.acceptedDatesAndTimes === 'undefined') {
    throw new InvalidInputError('acceptedDatesAndTimes is not defined!');
  }

  const newInvitation = {
    invitation_id: uuidV4(),
    meeting_id: input.meetingId,
    attendant_email: input.attendantEmail,
    accepted_dates_and_times: JSON.stringify(input.acceptedDatesAndTimes),
  };

  try {
        // check that the meetingId is valid
    const meeting = await database.getMeetingById(newInvitation.meeting_id);
    if (!meeting) {
      throw new InvalidInputError('invalid meetingId!');
    }
        // create a new invitation
    await database.createInvitation(newInvitation);
    invitationFromDatabase = await database.getInvitationById(newInvitation.invitation_id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return invitationFromDatabase;
}

async function getAll() {
  debug('[getAll]');
  let invitations;

  try {
    invitations = await database.getAllInvitations();
  } catch (e) {
    debug(e);
    throw e;
  }

  return invitations;
}

async function deleteAll() {
  debug('[deleteAll]');
  try {
    await database.deleteAllInvitations();
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function deleteAllByMeetingId(id) {
  debug('[deleteAllByMeetingId]');
  try {
    await database.deleteAllInvitationsByMeetingId(id);
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function getAllByMeetingId(id) {
  debug('[getAllByMeetingId]');
  let invitationsFromDatabase;

  try {
    invitationsFromDatabase = await database.getInvitationsByMeetingId(id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return invitationsFromDatabase;
}

async function getById(id) {
  debug('[getById]');
  let invitationFromDatabase;

  try {
    invitationFromDatabase = await database.getInvitationById(id);
  } catch (e) {
    debug(e);
    throw e;
  }

  if (!invitationFromDatabase) {
    throw new NotFoundError('Resource not found!');
  }

  return invitationFromDatabase;
}

async function deleteOne(id) {
  debug('[deleteOne]');
  try {
    const invitation = await database.getInvitationById(id);
    if (!invitation) {
      throw new NotFoundError('Resource not found!');
    }
    await database.deleteInvitation(id);
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function update(input) {
  debug('[update]');
  let invitationFromDatabase;

  const newData = { invitation_id: input.invitationId };

  if (input.meetingId) {
    try {
            // check that the meetingId is valid
      const meeting = await database.getMeetingById(input.meetingId);
      if (!meeting) {
        throw new InvalidInputError('invalid meetingId!');
      }
    } catch (e) {
      debug(e);
      throw e;
    }
    newData.meeting_id = input.meetingId;
  }
  if (input.attendantEmail) {
    newData.attendant_email = input.attendantEmail;
  }
  if (input.acceptedDatesAndTimes) {
    newData.accepted_dates_and_times = JSON.stringify(input.acceptedDatesAndTimes);
  }

  if (!input.meetingId && !input.attendantEmail && !input.acceptedDatesAndTimes) {
    throw new InvalidInputError('Invalid input!');
  }

  try {
    const invitation = await database.getInvitationById(input.invitationId);
    if (!invitation) {
      throw new NotFoundError('Resource not found!');
    }
        // update the invitation
    await database.updateInvitation(newData);
    invitationFromDatabase = await database.getInvitationById(newData.invitation_id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return invitationFromDatabase;
}

export default {
  create,
  getAll,
  getAllByMeetingId,
  getById,
  deleteAll,
  deleteAllByMeetingId,
  deleteOne,
  update,
};
