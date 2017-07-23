import express from 'express';
import _debug from 'debug';
import { usersService } from '../services';

const debug = _debug('routes:users');
const router = express.Router();

/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       user_id:
 *         type: string
 *       user_name:
 *         type: string
 *       email:
 *         type: string
 *   UserPost:
 *     properties:
 *       username:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     required:
 *       - username
 *       - email
 *       - password
 *   UserUpdate:
 *     properties:
 *       username:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Posts a user
 *     description: Creates a new user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: input
 *         description: Data describing the new user
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserPost'
 *     responses:
 *       200:
 *         description: The new created user
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: Invalid input / Duplicate error
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/users', async (req, res) => {
  debug('[POST /users]');
  try {
    const user = await usersService.create(req.body);
    debug('user:', user);
    res.json(user);
  } catch (e) {
    switch (e.code) {
      case 'DuplicateError':
      case 'InvalidInputError':
        res.status(400).json(e);
        break;
      default:
        res.sendStatus(500);
        throw e;
    }
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Gets all users
 *     description: Returns an array with all users
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array with all users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 *       500:
 *         description: Internal server error
 * /users?email:
 *   get:
 *     summary: Gets a single user
 *     description: Returns a single user by email
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: User's email
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
 *       404:
 *         description: User not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/users', async (req, res) => {
  if (req.query.email) {
    debug('[GET /users?email]');
    try {
      const user = await usersService.getByEmail(req.query.email);
      debug('user:', user);
      res.json(user);
    } catch (e) {
      switch (e.code) {
        case 'NotFoundError':
          res.status(404).json(e);
          break;
        default:
          res.sendStatus(500);
          throw e;
      }
    }
    return;
  }

  debug('[GET /users]');
  try {
    const users = await usersService.getAll();
    res.json(users);
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Deletes all users
 *     description: Deletes all users and associated data
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All users have been deleted!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       500:
 *         description: Internal server error
 */
router.delete('/users', async (req, res) => {
  debug('[DELETE /users]');
  try {
    await usersService.deleteAll();
    res.json({ message: 'All users have been deleted!' });
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Gets a single user
 *     description: Returns a user by {id}
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
 *       404:
 *         description: User not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/users/:userId', async (req, res) => {
  debug('[GET /users/:userId]');
  try {
    const user = await usersService.getById(req.params.userId);
    debug('user:', user);
    res.json(user);
  } catch (e) {
    switch (e.code) {
      case 'NotFoundError':
        res.status(404).json(e);
        break;
      default:
        res.sendStatus(500);
        throw e;
    }
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Updates a user
 *     description: Updates a user by {id}
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: input
 *         description: Fields for the User resource
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserUpdate'
 *     responses:
 *       200:
 *         description: The updated user
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: Invalid input
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       404:
 *         description: User not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.put('/users/:userId', async (req, res) => {
  debug('[PUT /users/:userId]');
  req.body.userId = req.params.userId;

  try {
    const user = await usersService.update(req.body);
    debug('user:', user);
    res.json(user);
  } catch (e) {
    switch (e.code) {
      case 'NotFoundError':
        res.status(404).json(e);
        break;
      case 'InvalidInputError':
        res.status(400).json(e);
        break;
      default:
        res.sendStatus(500);
        throw e;
    }
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletes a single user
 *     description: Deletes a user by {id} and associated data
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User {id} was deleted successfully!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       404:
 *         description: User not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:userId', async (req, res) => {
  debug('[DELETE /users/:userId]');
  try {
    await usersService.deleteOne(req.params.userId);
    res.json({ message: `User ${req.params.userId} was deleted successfully!` });
  } catch (e) {
    switch (e.code) {
      case 'NotFoundError':
        res.status(404).json(e);
        break;
      default:
        res.sendStatus(500);
        throw e;
    }
  }
});

module.exports = router;
