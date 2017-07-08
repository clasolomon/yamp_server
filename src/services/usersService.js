import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import InvalidInputError from '../customErrors/InvalidInputError';
import DuplicateError from '../customErrors/DuplicateError';
import NotFoundError from '../customErrors/NotFoundError';
import database from '../database';

const debug = _debug('services:usersService');

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

async function create(input) {
  debug('[create]');
  let userFromDatabase;

  if (typeof input.username === 'undefined') {
    throw new InvalidInputError('username is not defined!');
  }

  if (typeof input.email === 'undefined') {
    throw new InvalidInputError('email is not defined!');
  }

  if (typeof input.password === 'undefined') {
    throw new InvalidInputError('password is not defined!');
  }

    // check if a user with the same email already exists
  try {
    userFromDatabase = await database.getUserByEmail(input.email);
  } catch (e) {
    debug(e);
    throw e;
  }

    // throw error if user already exists
  if (userFromDatabase) {
    debug('user by email:', userFromDatabase);
    throw new DuplicateError('Resource already exists!');
  }

  const newUser = {
    user_id: uuidV4(),
    user_name: input.username,
    email: input.email,
    password: generateHash(input.password),
  };

    // create new user
  try {
    await database.createUser(newUser);
        // get the newly created user from database
    userFromDatabase = await database.getUserById(newUser.user_id);
        // do not return the user with the password
    delete userFromDatabase.password;
  } catch (e) {
    debug(e);
    throw e;
  }

  return userFromDatabase;
}

async function getByEmail(email) {
  debug('[getByEmail]');
  let userFromDatabase;

  try {
    userFromDatabase = await database.getUserByEmail(email);
  } catch (e) {
    debug(e);
    throw e;
  }

  if (userFromDatabase) {
        // do not return the user with the password
    delete userFromDatabase.password;
  } else {
    throw new NotFoundError('Resource not found!');
  }

  return userFromDatabase;
}

async function getById(id) {
  debug('[getById]');
  let userFromDatabase;

  try {
    userFromDatabase = await database.getUserById(id);
  } catch (e) {
    debug(e);
    throw e;
  }

  if (userFromDatabase) {
        // do not return the user with the password
    delete userFromDatabase.password;
  } else {
    throw new NotFoundError('Resource not found!');
  }

  return userFromDatabase;
}

async function getAll() {
  debug('[getAll]');
  let usersFromDatabase;

  try {
    usersFromDatabase = await database.getAllUsers();
    if (usersFromDatabase.length) {
            // do not return the users with the password
      usersFromDatabase = usersFromDatabase.map(user => ({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
      }));
    }
  } catch (e) {
    debug(e);
    throw e;
  }

  return usersFromDatabase;
}

async function deleteAll() {
  debug('[deleteAll]');
  try {
    await database.deleteAllUsers();
    await database.deleteAllMeetings();
    await database.deleteAllInvitations();
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function deleteOne(id) {
  debug('[deleteOne]');
  try {
    const user = await database.getUserById(id);
    if (!user) {
      throw new NotFoundError('Resource not found!');
    }
    await database.deleteUser(id);
    const meetings = await database.getAllMeetingsByUserId(id);
    if (meetings.length) {
      meetings.forEach(async (meeting) => {
        await database.deleteAllInvitationsByMeetingId(meeting.meeting_id);
        await database.deleteMeeting(meeting.meeting_id);
      });
    }
  } catch (e) {
    debug(e);
    throw e;
  }
}

async function update(input) {
  debug('[update]');
  let userFromDatabase;

  const modifiedUser = {
    user_id: input.userId,
  };

  if (input.username) {
    modifiedUser.user_name = input.username;
  }

  if (input.email) {
    modifiedUser.email = input.email;
  }

  if (input.password) {
    modifiedUser.password = generateHash(input.password);
  }

  if (!input.username && !input.email && !input.password) {
    throw new InvalidInputError('Invalid input!');
  }

  try {
    const user = await database.getUserById(input.userId);
    if (!user) {
      throw new NotFoundError('Resource not found!');
    }
    await database.updateUser(modifiedUser);
    userFromDatabase = await database.getUserById(input.userId);
    delete userFromDatabase.password;
    if (input.password) {
      userFromDatabase.message = 'Password changed successfully!';
    }
  } catch (e) {
    debug(e);
    throw e;
  }

  return userFromDatabase;
}

export default {
  create,
  getByEmail,
  getAll,
  getById,
  deleteAll,
  deleteOne,
  update,
};
