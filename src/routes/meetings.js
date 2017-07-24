import express from 'express';
import _debug from 'debug';
import { meetingsService } from '../services';

const debug = _debug('routes:meetings');
const router = express.Router();


/**
 * @swagger
 * definitions:
 *   Meeting:
 *     properties:
 *       meeting_id:
 *         type: string
 *       meeting_name:
 *         type: string
 *       meeting_description:
 *         type: string
 *       initiated_by:
 *         type: string
 *       proposed_dates_and_times:
 *         type: string
 *   MeetingPost:
 *     properties:
 *       meetingName:
 *         type: string
 *       meetingDescription:
 *         type: string
 *       initiatedBy:
 *         type: string
 *       proposedDatesAndTimes:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *             endDate:
 *               type: string
 *             required:
 *               - startDate
 *               - endDate
 *     required:
 *       - meetingName
 *       - initiatedBy
 *       - proposedDatesAndTimes
 *   MeetingUpdate:
 *     properties:
 *       meetingName:
 *         type: string
 *       meetingDescription:
 *         type: string
 *       initiatedBy:
 *         type: string
 *       proposedDatesAndTimes:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *             endDate:
 *               type: string
 *             required:
 *               - startDate
 *               - endDate
 */

/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Posts a meeting
 *     description: Creates a new meeting
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: input
 *         description: Data describing the new meeting
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/MeetingPost'
 *     responses:
 *       200:
 *         description: The new created meeting
 *         schema:
 *           $ref: '#/definitions/Meeting'
 *       400:
 *         description: Invalid input error
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/meetings', async (req, res) => {
  debug('[POST /meetings]');
  try {
    const meeting = await meetingsService.create(req.body);
    debug(meeting);
    res.json(meeting);
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

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Gets all meetings
 *     description: Returns an array with all meetings
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array with all meetings
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Meeting'
 *       500:
 *         description: Internal server error
 * /meetings?initiatedBy:
 *   get:
 *     summary: Gets a single meeting
 *     description: Returns a single meeting by the id of user who created the meeting
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: initiatedBy
 *         description: The id of the user who created the meeting
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single meeting
 *         schema:
 *           $ref: '#/definitions/Meeting'
 *       404:
 *         description: Meeting not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/meetings', async (req, res) => {
  if (req.query.initiatedBy) {
    debug('[GET /meetings?initiatedBy]');
    try {
      const meetings = await meetingsService.getAllByUserId(req.query.initiatedBy);
      res.json(meetings);
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

  debug('[GET /meetings]');
  try {
    const meetings = await meetingsService.getAll();
    res.json(meetings);
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

/**
 * @swagger
 * /meetings:
 *   delete:
 *     summary: Deletes all meetings
 *     description: Deletes all meetings and associated data
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All meetings have been deleted!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       500:
 *         description: Internal server error
 */
router.delete('/meetings', async (req, res) => {
  debug('[DELETE /meetings]');
  try {
    await meetingsService.deleteAll();
    res.json({ message: 'All meetings have been deleted!' });
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

/**
 * @swagger
 * /meetings/{id}:
 *   get:
 *     summary: Gets a single meeting
 *     description: Returns a meeting by {id}
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Meeting's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single meeting
 *         schema:
 *           $ref: '#/definitions/Meeting'
 *       404:
 *         description: Meeting not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/meetings/:meetingId', async (req, res) => {
  debug('[GET /meetings/:meetingId]');
  try {
    const meeting = await meetingsService.getById(req.params.meetingId);
    res.json(meeting);
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
 * /meetings/{id}:
 *   put:
 *     summary: Updates a meeting
 *     description: Updates a meeting by {id}
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Meeting's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: input
 *         description: Fields for the Meeting resource
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/MeetingUpdate'
 *     responses:
 *       200:
 *         description: The updated meeting
 *         schema:
 *           $ref: '#/definitions/Meeting'
 *       400:
 *         description: Invalid input
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       404:
 *         description: Meeting not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.put('/meetings/:meetingId', async (req, res) => {
  debug('[PUT /meetings/:meetingId]');
  req.body.meetingId = req.params.meetingId;
  try {
    const meeting = await meetingsService.update(req.body);
    res.json(meeting);
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
 * /meetings/{id}:
 *   delete:
 *     summary: Deletes a single meeting
 *     description: Deletes a meeting by {id} and associated data
 *     tags:
 *       - Meetings
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Meeting's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Meeting {id} was deleted successfully!
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Response'
 *       404:
 *         description: Meeting not found
 *         schema:
 *           $ref: 'jsdoc/commonDefinitions.yaml#/definitions/Error'
 *       500:
 *         description: Internal server error
 */
router.delete('/meetings/:meetingId', async (req, res) => {
  debug('[DELETE /meetings/:meetingId]');
  try {
    await meetingsService.deleteOne(req.params.meetingId);
    res.json({ message: `Meeting ${req.params.meetingId} was deleted successfully!` });
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
