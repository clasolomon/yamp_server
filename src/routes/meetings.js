import express from 'express';
import uuidV4 from 'uuid/v4';
import _debug from 'debug';
import database from '../database';

const debug = _debug('routes:meetings');
const router = express.Router();

// create new meeting
router.post('/meetings', (req, res) => {
  const newMeeting = {
    meeting_id: uuidV4(),
    meeting_name: req.body.meetingName,
    meeting_description: req.body.meetingDescription,
    initiated_by: req.body.initiatedBy,
    proposed_dates_and_times: JSON.stringify(req.body.proposedDatesAndTimes),
  };
  return database.createMeeting(newMeeting)
        .then(
            () => {
              res.json({ meetingId: newMeeting.meeting_id });
            },
        )
        .catch(
            (err) => {
              debug(err);
              res.sendStatus(500);
            },
        );
});

// get a list of all meetings
router.get('/meetings', (req, res) => {
  if (req.query.initiated_by) {
    return database.getAllMeetingsByUserId(req.query.initiated_by)
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
            );
  }
  return database.getAllMeetings()
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
        );
});

// delete all meetings
router.delete('/meetings', (req, res) => database.deleteAllMeetings()
        .then(
            () =>
                // delete all invitations
               database.deleteAllInvitations()
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

// get meeting with meetingId
router.get('/meetings/:meetingId', (req, res) => database.getMeetingById(req.params.meetingId)
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

// update meeting with meetingId
router.put('/meetings/:meetingId', (req, res) => {
  const modifiedMeeting = {
    meeting_id: req.params.userId,
    meeting_name: req.body.meetingName,
    meeting_description: req.body.meetingDescription,
    initiated_by: req.body.initiatedBy,
    proposed_dates_and_time: req.body.proposedDatesAndTimes,
  };

  return database.updateMeeting(modifiedMeeting)
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

// delete meeting with meetingId
router.delete('/meetings/:meetingId', (req, res) => database.deleteMeeting(req.params.meetingId)
        .then(
            () =>
                // delete all invitations to this meeting
               database.deleteAllInvitationsByMeetingId(req.params.meetingId)
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
