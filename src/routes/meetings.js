import express from 'express';
import _debug from 'debug';
import { meetingsService } from '../services';

const debug = _debug('routes:meetings');
const router = express.Router();

// create new meeting
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

// get a list of all meetings
router.get('/meetings', async (req, res) => {
  if (req.query.initiatedBy) {
    debug('[GET /meetings?initiatedBy]');
    try {
      const meetings = await meetingsService.getAllByUserId(req.query.initiatedBy);
      res.json(meetings);
    } catch (e) {
      res.sendStatus(500);
      throw e;
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

// delete all meetings
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

// get meeting with meetingId
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

// update meeting with meetingId
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

// delete meeting with meetingId
router.delete('/meetings/:meetingId', async (req, res) => {
  debug('[DELETE /meetings/:meetingId]');
  try {
    await meetingsService.deleteOne(req.params.meetingId);
    res.json({ message: `Meeting ${req.params.meetingId} was deleted successfully!` });
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
});

module.exports = router;
