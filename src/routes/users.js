import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';

const debug = _debug('routes:users');

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

const router = express.Router();

// create new user
router.post('/users', (req, res) => {
  const newUser = {
    user_id: uuidV4(),
    user_name: req.body.username,
    email: req.body.email,
    password: generateHash(req.body.password),
  };

  return database.getUserByEmail(req.body.email)
        .then(
            (user) => {
              if (user) {
                return res.status(400).json({ error: 'Resource already exists!' });
              }
              return database.createUser(newUser)
                    .then(
                        () => {
                          res.json({ userId: newUser.user_id, email: newUser.email });
                        },
                    );
            },
        ).catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// get a list of all users
router.get('/users', (req, res) => {
  if (req.query.email) {
    return database.getUserByEmail(req.query.email)
            .then(
                (user) => {
                  if (user) {
                    res.json({
                      user_id: user.user_id,
                      user_name: user.user_name,
                      email: user.email,
                    });
                  } else {
                    res.json(user);
                  }
                },
            )
            .catch(
                (err) => {
                  debug(err);
                  res.sendStatus(500);
                },
            );
  }
  return database.getAllUsers()
        .then(
            (users) => {
              if (users.length) {
                const allUsers = users.map(user => ({
                  user_id: user.user_id,
                  user_name: user.user_name,
                  email: user.email,
                }));
                res.json(allUsers);
              } else {
                res.json(users);
              }
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// delete all users
router.delete('/users', (req, res) => database.deleteAllUsers()
    .then(
        () =>
        // delete all meetings
        database.deleteAllMeetings()
        .then(
            () =>
            // delete all invitations
            database.deleteAllInvitations()
            .then(
                () => {
                  res.json(true);
                },
            ),
        ),
    )
    .catch(
        (err) => {
          debug(err);
          res.sendStatus(500);
        },
    ));

// get user with user_id
router.get('/users/:userId', (req, res) => database.getUserById(req.params.userId)
    .then(
        (user) => {
          res.json(user);
        },
    )
    .catch(
        (err) => {
          debug(err);
          res.sendStatus(500);
        },
    ));

// update user with userId
router.put('/users/:userId', (req, res) => {
  const modifiedUser = {
    user_id: req.params.userId,
    user_name: req.body.username,
    email: req.body.email,
  };

  if (req.body.password) {
    modifiedUser.password = generateHash(req.body.password);
  }

  return database.updateUser(modifiedUser)
        .then(
            () => {
              res.json(true);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// delete user with userId
router.delete('/users/:userId', (req, res) => database.deleteUser(req.params.userId)
    .then(
        () =>
        // get all the meetings created by this user
        database.getAllMeetingsByUserId(req.params.userId)
        .then(
            (meetings) => {
              if (meetings.length) {
                    // this array contains the promises for each meeting deletion
                const promises = meetings.map(meeting =>
                        // delete all the invitations to each meeting
                         database.deleteAllInvitationsByMeetingId(meeting.meeting_id)
                            .then(
                                // finally delete the meeting
                                () => database.deleteMeeting(meeting.meeting_id),
                            )
                            .catch(
                                (err) => {
                                  debug(err);
                                  res.sendStatus(500);
                                },
                            ));
                  // after all meetings and associated invitations have been deleted
                  // send a response
                return Promise.all(promises).then(
                        () => {
                          res.json(true);
                        },
                    );
              }
              return res.json(true);
            },
        ),
    )
    .catch(
        (err) => {
          debug(err);
          res.sendStatus(500);
        },
    ));

module.exports = router;
