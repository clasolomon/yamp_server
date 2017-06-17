import express from 'express';
import database from '../database';
import uuidV4 from 'uuid/v4';

const router = express.Router();

// create new meeting
router.post('/meetings', function(req, res, next){
    var newMeeting = {
        meeting_id: uuidV4(),
        meeting_name: req.body.meetingName,
        meeting_description: req.body.meetingDescription,
        initiated_by: req.body.initiatedBy,
        proposed_dates_and_times: JSON.stringify(req.body.proposedDatesAndTimes)
    };
    return database.createMeeting(newMeeting)
        .then(
            ()=>{
                res.json({meetingId: newMeeting.meeting_id});
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get a list of all meetings
router.get('/meetings', function(req, res, next){
    return database.getAllMeetings()
        .then(
            (meetings)=>{
                res.json(meetings);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// delete all meetings
router.delete('/meetings', function(req, res, next){
    return database.deleteAllMeetings()
        .then(
            ()=>{
                res.json(true);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get meeting with meetingId
router.get('/meetings/:meetingId', function(req, res, next){
    return database.getMeetingById(req.params.meetingId)
        .then(
            (meeting)=>{
                res.json(meeting);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// update meeting with meetingId
router.put('/meetings/:meetingId', function(req, res, next){
    var modifiedMeeting = {
        meeting_id: req.params.userId,
        meeting_name: req.body.meetingName,
        meeting_description: req.body.meetingDescription,
        initiated_by: req.body.initiatedBy,
        proposed_dates_and_time: req.body.proposedDatesAndTimes
    };

    return database.updateMeeting(modifiedMeeting)
        .then(
            ()=>{
                res.json(true);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// delete meeting with meetingId
router.delete('/meetings/:meetingId', function(req, res, next){
    return database.deleteMeeting(req.params.meetingId)
        .then(
            ()=>{
                res.json(true);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

module.exports = router;
