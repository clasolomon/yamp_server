import express from 'express';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';
import sendEmailInvitation from '../sendmail';

const debug = _debug('routes:invitations');
const router = express.Router();

// create new invitation
router.post('/invitations', (req, res) => {
  const newInvitation = {
    invitation_id: uuidV4(),
    meeting_id: req.body.meetingId,
    attendant_email: req.body.attendantEmail,
    accepted_dates_and_times: req.body.acceptedDatesAndTimes,
  };
  return database.createInvitation(newInvitation)
        .then(
            () => {
              res.json({ invitationId: newInvitation.invitation_id });
                // send meeting invitation
              const meetingInvitationLink = `http://localhost:3000/meeting-invitation/${newInvitation.invitation_id}`;
              sendEmailInvitation(meetingInvitationLink, newInvitation.attendant_email);
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
router.get('/invitations', (req, res) => {
  if (req.query.meeting_id) {
    return database.getInvitationsByMeetingId(req.query.meeting_id)
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
  return database.getAllInvitations()
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

// delete all invitations
router.delete('/invitations', (req, res) => database.deleteAllInvitations()
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

// get invitation with invitationId
router.get('/invitations/:invitationId', (req, res) => database.getInvitationById(req.params.invitationId)
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

// update invitation with invitationId
router.put('/invitations/:invitationId', (req, res) => {
  const modifiedInvitation = {
    invitation_id: req.params.invitationId,
    meeting_id: req.body.meetingId,
    attendant_email: req.body.attendantEmail,
    accepted_dates_and_times: JSON.stringify(req.body.acceptedDatesAndTimes),
  };

  return database.updateInvitation(modifiedInvitation)
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

// delete invitation with invitationId
router.delete('/invitations/:invitationId', (req, res) => database.deleteInvitation(req.params.invitationId)
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
