import express from 'express';
import _debug from 'debug';
import { usersService } from '../services';

const debug = _debug('routes:users');
const router = express.Router();

// create new user
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

// get a list of all users
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

// delete all users
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

// get user with userId
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

// update user with userId
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

// delete user with userId
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
