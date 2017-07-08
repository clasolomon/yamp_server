import express from 'express';
import _debug from 'debug';
import sendEmailInvitation from '../sendmail';
import { invitationsService } from '../services';

const debug = _debug('routes:invitations');
const router = express.Router();

// create new invitation
router.post('/invitations', async (req, res, next) => {
  debug('[POST /invitations]');
  try {
    const invitation = await invitationsService.create(req.body);
    debug(invitation);
    req.invitation = invitation;
    next();
  } catch (e) {
    switch (e.code) {
      case 'InvalidInputError':
        res.status(400).json(e);
        break;
      default:
        res.sendStatus(500);
        throw e;
    }
  }
});

// send email invitation
router.post('/invitations', (req, res) => {
  debug('[POST /invitations][send email]');
    // send meeting invitation
  const meetingInvitationLink = `http://localhost:3000/meeting-invitation/${req.invitation.invitation_id}`;
  sendEmailInvitation(meetingInvitationLink, req.invitation.attendant_email);
  res.json(req.invitation);
});

// get a list of all invitations
router.get('/invitations', async (req, res) => {
  if (req.query.meetingId) {
    debug('[GET /invitations?meetingId]');
    try {
      const invitations = await invitationsService.getAllByMeetingId(req.query.meetingId);
      res.json(invitations);
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

  debug('[GET /invitations]');
  try {
    const invitations = await invitationsService.getAll();
    res.json(invitations);
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

// delete all invitations
router.delete('/invitations', async (req, res) => {
  if (req.query.meetingId) {
    debug('[DELETE /invitations?meetingId]');
    try {
      await invitationsService.deleteAllByMeetingId(req.query.meetingId);
      res.json({ message: `All invitations to meeting ${req.query.meetingId} have been deleted!` });
    } catch (e) {
      res.sendStatus(500);
      throw e;
    }
    return;
  }

  debug('[DELETE /invitations]');
  try {
    await invitationsService.deleteAll();
    res.json({ message: 'All invitations have been deleted!' });
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

// get invitation with invitationId
router.get('/invitations/:invitationId', async (req, res) => {
  debug('[GET /invitations/:invitationId]');
  try {
    const invitation = await invitationsService.getById(req.params.invitationId);
    res.json(invitation);
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

// update invitation with invitationId
router.put('/invitations/:invitationId', async (req, res) => {
  debug('[PUT /invitations/:invitationId]');
  req.body.invitationId = req.params.invitationId;

  try {
    const invitation = await invitationsService.update(req.body);
    res.json(invitation);
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

// delete invitation with invitationId
router.delete('/invitations/:invitationId', async (req, res) => {
  debug('[DELETE /invitations/:invitationId]');
  try {
    await invitationsService.deleteOne(req.params.invitationId);
    res.json({ message: `Invitation ${req.params.invitationId} was deleted successfully!` });
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

module.exports = router;
