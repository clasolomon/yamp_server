import express from 'express';
import _debug from 'debug';
import sendEmailInvitation from '../sendmail';
import { invitationsService } from '../services';

const debug = _debug('routes:invitations');
const router = express.Router();

/**
 * @swagger
 * definitions:
 *   Invitation:
 *     properties:
 *       invitation_id:
 *         type: string
 *       meeting_id:
 *         type: string
 *       attendat_email:
 *         type: string
 *       accepted_dates_and_times:
 *         type: string
 *   InvitationPost:
 *     properties:
 *       meetingId:
 *         type: string
 *       attendantEmail:
 *         type: string
 *       acceptedDatesAndTimes:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *             endDate:
 *               type: string
 *           required: true
 *     required:
 *       - meetingId
 *       - attendantEmail
 *       - acceptedDatesAndTimes
 *   InvitationUpdate:
 *     properties:
 *       meetingId:
 *         type: string
 *       attendantEmail:
 *         type: string
 *       acceptedDatesAndTimes:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *             endDate:
 *               type: string
 */

/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: Posts an invitation
 *     description: Creates a new invitation
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: input
 *         description: Data describing the new invitation
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/InvitationPost'
 *     responses:
 *       200:
 *         description: The new created invitation
 *         schema:
 *           $ref: '#/definitions/Invitation'
 *       400:
 *         description: Invalid input
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /invitations:
 *   get:
 *     summary: Gets all invitations
 *     description: Returns an array with all invitations
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array with all invitations
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Invitation'
 *       500:
 *         description: Internal server error
 * /invitations?meetingId:
 *   get:
 *     summary: Gets all invitations to a meeting
 *     description: Returns an array with all invitations to a meeting
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: meetingId
 *         description: The id of meeting to which the invitations have been made
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: An array with invitations
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Invitation'
 *       404:
 *         description: Invitation not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /invitations:
 *   delete:
 *     summary: Deletes all invitations
 *     description: Deletes all invitations
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All invitations have been deleted!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       500:
 *         description: Internal server error
 * /invitations?meetingId:
 *   delete:
 *     summary: Deletes all invitations to a meeting
 *     description: Deletes all invitations to a meeting by meetingId
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: meetingId
 *         description: The id of the meeting for which all invitattions shall be deleted
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: All invitations to meeting {meetingId} have been deleted!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /invitations/{id}:
 *   get:
 *     summary: Gets a single invitation
 *     description: Returns an invitation by {id}
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Invitation's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single invitation
 *         schema:
 *           $ref: '#/definitions/Invitation'
 *       404:
 *         description: Invitation not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /invitations/{id}:
 *   put:
 *     summary: Updates an invitation
 *     description: Updates an invitation by {id}
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Invitation's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: input
 *         description: Fields for the Invitation resource
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/InvitationUpdate'
 *     responses:
 *       200:
 *         description: The updated invitation
 *         schema:
 *           $ref: '#/definitions/Invitation'
 *       400:
 *         description: Invalid input
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       404:
 *         description: Invitation not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /invitations/{id}:
 *   delete:
 *     summary: Deletes a single invitation
 *     description: Deletes an invitation by {id}
 *     tags:
 *       - Invitations
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Invitation's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Invitation {id} was deleted successfully!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       404:
 *         description: Invitation not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.delete('/invitations/:invitationId', async (req, res) => {
  debug('[DELETE /invitations/:invitationId]');
  try {
    await invitationsService.deleteOne(req.params.invitationId);
    res.json({ message: `Invitation ${req.params.invitationId} was deleted successfully!` });
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
