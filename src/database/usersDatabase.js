import assert from 'assert';
import _debug from 'debug';
import sqlite3Wrapper from './sqlite3Wrapper';

const debug = _debug('database:usersDatabase');

/**
 * Create user.
 * @param {object} input - contains input data for columns in "Users" table
 * @return {Promise}
 */
export function createUser(input) {
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
export function getAllUsers() {
  const statement = 'SELECT user_id, user_name, email FROM Users';
  return sqlite3Wrapper.allPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete all users.
 * @return {Promise}
 */
export function deleteAllUsers() {
  const statement = 'DELETE FROM Users';
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Get user by email.
 * @param {String} email - the email to search by
 * @return {Promise}
 */
export function getUserByEmail(email) {
  assert(email, 'email must be specified!');

  const statement = `SELECT user_id, user_name, email, password FROM Users WHERE email='${email}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Get user by id.
 * @param {String} id - the id to search by
 * @return {Promise}
 */
export function getUserById(id) {
  assert(id, 'id must be specified!');

  const statement = `SELECT user_id, user_name, email, password FROM Users WHERE user_id='${id}'`;

  return sqlite3Wrapper.getPromisified(statement, 'SELECT FROM Users');
}

/**
 * Delete user.
 * @param {String} id - the id of the user to be deleted
 * @return {Promise}
 */
export function deleteUser(id) {
  const statement = `DELETE FROM Users WHERE user_id='${id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'DELETE FROM Users');
}

/**
 * Update user.
 * @param {String} input - contains update user data
 * @return {Promise}
 */
export function updateUser(input) {
  assert(input, 'input must be specified!');
  assert(input.user_id, 'input.user_id must be specified!');

  const fields = [];

  if (input.user_name) {
    fields[fields.length] = `user_name='${input.user_name}'`;
  }
  if (input.email) {
    fields[fields.length] = `email='${input.email}'`;
  }
  if (input.password) {
    fields[fields.length] = `password='${input.password}'`;
  }

  const statement = `UPDATE Users SET ${fields.join(', ')} WHERE user_id='${input.user_id}'`;
  return sqlite3Wrapper.runPromisified(statement, 'UPDATE Users');
}

export default {
  createUser,
  getAllUsers,
  deleteAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};
