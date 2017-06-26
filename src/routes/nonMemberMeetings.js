import express from 'express';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';

const debug = _debug('routes:nonMemberMeetings');
const router = express.Router();

// create new non member meeting
router.post('/nonMemberMeetings', (req, res) => {
  const newMeeting = {
    meetingId: uuidV4(),
    meetingName: req.body.meetingName,
    meetingDescription: req.body.meetingDescription,
    username: req.body.username,
    userEmail: req.body.userEmail,
    proposedDatesAndTimes: JSON.stringify(req.body.proposedDatesAndTimes),
  };
  return database.createNonMemberMeeting(newMeeting)
        .then(
            () => {
              res.json({ meetingId: newMeeting.meetingId });
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// get a list of all non member meetings
router.get('/nonMemberMeetings', (req, res) => database.getAllNonMemberMeetings()
        .then(
            (meetings) => {
              res.json(meetings);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        ));

// delete all non member meetings
router.delete('/nonMemberMeetings', (req, res) => database.deleteAllNonMemberMeetings()
        .then(
            () =>
                // delete all non member meeting invitations
               database.deleteAllNonMemberInvitations()
                    .then(
                        () => {
                          res.json(true);
                        },
                    ),
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        ));

// get non member meeting with meetingId
router.get('/nonMemberMeetings/:meetingId', (req, res) => database.getNonMemberMeetingById(req.params.meetingId)
        .then(
            (meeting) => {
              res.json(meeting);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        ));

// update non member meeting with meetingId
router.put('/nonMemberMeetings/:meetingId', (req, res) => {
  const modifiedMeeting = {
    meetingId: req.params.userId,
    meetingName: req.body.meetingName,
    meetingDescription: req.body.meetingDescription,
    username: req.body.username,
    userEmail: req.body.userEmail,
    proposedDatesAndTimes: req.body.proposedDatesAndTimes,
  };

  return database.updateNonMemberMeeting(modifiedMeeting)
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

// delete non member meeting with meetingId
router.delete('/nonMemberMeetings/:meetingId', (req, res) => database.deleteNonMemberMeeting(req.params.meetingId)
        .then(
            () =>
                // delete all invitations to this meeting
               database.deleteAllNonMemberInvitationsByMeetingId(req.params.meetingId)
                    .then(
                        () => {
                          res.json(true);
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
