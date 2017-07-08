import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';
import NotFoundError from '../customErrors/NotFoundError';
import InvalidInputError from '../customErrors/InvalidInputError';

const debug = _debug('services:meetingsService');

async function create(input) {
  debug('[create]');
  let meetingFromDatabase;

  if (typeof input.meetingName === 'undefined') {
    throw new InvalidInputError('meetingName is not defined!');
  }

  if (typeof input.initiatedBy === 'undefined') {
    throw new InvalidInputError('initiatedBy is not defined!');
  }

  if (typeof input.proposedDatesAndTimes === 'undefined') {
    throw new InvalidInputError('proposedDatesAndTimes is not defined!');
  }

  try {
        // check that initiatedBy is valid
    const user = await database.getUserById(input.initiatedBy);
    if (!user) {
      throw new InvalidInputError('invalid initiatedBy!');
    }
  } catch (e) {
    debug(e);
    throw e;
  }

  const newMeeting = {
    meeting_id: uuidV4(),
    meeting_name: input.meetingName,
    meeting_description: input.meetingDescription,
    initiated_by: input.initiatedBy,
    proposed_dates_and_times: JSON.stringify(input.proposedDatesAndTimes),
  };

  try {
    await database.createMeeting(newMeeting);
    meetingFromDatabase = await database.getMeetingById(newMeeting.meeting_id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return meetingFromDatabase;
}

async function getAll() {
  debug('[getAll]');
  let meetings;

  try {
    meetings = await database.getAllMeetings();
  } catch (e) {
    debug(e);
    throw e;
  }

  return meetings;
}

async function deleteAll() {
  debug('[deleteAll]');
  try {
    await database.deleteAllMeetings();
    await database.deleteAllInvitations();
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function getAllByUserId(id) {
  debug('[getAllByUserId]');
  let meetingsFromDatabase;

  try {
    meetingsFromDatabase = await database.getAllMeetingsByUserId(id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return meetingsFromDatabase;
}

async function getById(id) {
  debug('[getById]');
  let meetingFromDatabase;

  try {
    meetingFromDatabase = await database.getMeetingById(id);
  } catch (e) {
    debug(e);
    throw e;
  }

  if (!meetingFromDatabase) {
    throw new NotFoundError('Resource not found!');
  }

  return meetingFromDatabase;
}

async function deleteOne(id) {
  debug('[deleteOne]');
  try {
    await database.deleteAllInvitationsByMeetingId(id);
    await database.deleteMeeting(id);
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function update(input) {
  debug('[update]');
  let meetingFromDatabase;

  const newData = { meeting_id: input.meetingId };

  if (input.meetingName) {
    newData.meeting_name = input.meetingName;
  }
  if (input.meetingDescription) {
    newData.meeting_description = input.meetingDescription;
  }
  if (input.initiatedBy) {
    try {
            // check that initiatedBy is valid
      const user = await database.getUserById(input.initiatedBy);
      if (!user) {
        throw new InvalidInputError('invalid initiatedBy!');
      }
    } catch (e) {
      debug(e);
      throw e;
    }

    newData.initiated_by = input.initiatedBy;
  }
  if (input.proposedDatesAndTimes) {
    newData.proposed_dates_and_times = JSON.stringify(input.proposedDatesAndTimes);
  }

  if (!input.meetingName && !input.meetingDescription &&
        !input.initiatedBy && !input.proposedDatesAndTimes) {
    throw new InvalidInputError('Invalid input!');
  }

  try {
    const meeting = await database.getMeetingById(input.meetingId);
    if (!meeting) {
      throw new NotFoundError('Resource not found!');
    }
    await database.updateMeeting(newData);
    meetingFromDatabase = await database.getMeetingById(newData.meeting_id);
  } catch (e) {
    debug(e);
    throw e;
  }

  return meetingFromDatabase;
}

export default {
  create,
  getAll,
  getAllByUserId,
  getById,
  deleteAll,
  deleteOne,
  update,
};
