import express from 'express';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';
import sendEmailInvitation from '../sendmail';

const debug = _debug('routes:nonMemberInvitations');
const router = express.Router();

// create new invitation
router.post('/nonMemberInvitations', (req, res) => {
  const newInvitation = {
    invitationId: uuidV4(),
    meetingId: req.body.meetingId,
    attendantEmail: req.body.attendantEmail,
    acceptedDatesAndTimes: req.body.acceptedDatesAndTimes,
  };
  return database.createNonMemberInvitation(newInvitation)
        .then(
            () => {
              res.json({ invitationId: newInvitation.invitationId });
                // send meeting invitation
              const meetingInvitationLink = `http://localhost:3000/non-member-invitation/${newInvitation.invitationId}`;
              sendEmailInvitation(meetingInvitationLink, newInvitation.attendantEmail);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// get a list of all invitations
router.get('/nonMemberInvitations', (req, res) => {
  if (req.query.meetingId) {
    return database.getNonMemberInvitationsByMeetingId(req.query.meetingId)
            .then(
                (invitations) => {
                  res.json(invitations);
                },
            )
            .catch(
                (err) => {
                  debug(err);
                  res.sendStatus(500);
                },
            );
  }
  return database.getAllNonMemberInvitations()
        .then(
            (invitations) => {
              res.json(invitations);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// delete all non member invitations
router.delete('/nonMemberInvitations', (req, res) => {
  if (req.query.meetingId) {
    return database.deleteAllNonMemberInvitationsByMeetingId(req.query.meetingId)
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
  }
  return database.deleteAllNonMemberInvitations()
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

// get non member invitation with invitationId
router.get('/nonMemberInvitations/:invitationId', (req, res) => database.getNonMemberInvitationById(req.params.invitationId)
        .then(
            (invitation) => {
              res.json(invitation);
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        ));

// update non member invitation with invitationId
router.put('/nonMemberInvitations/:invitationId', (req, res) => {
  const modifiedInvitation = {
    invitationId: req.params.invitationId,
    meetingId: req.body.meetingId,
    attendantEmail: req.body.attendantEmail,
    acceptedDatesAndTimes: JSON.stringify(req.body.acceptedDatesAndTimes),
  };

  return database.updateNonMemberInvitation(modifiedInvitation)
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

// delete non member invitation with invitationId
router.delete('/nonMemberInvitations/:invitationId', (req, res) => database.deleteNonMemberInvitation(req.params.invitationId)
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
        ));

module.exports = router;
