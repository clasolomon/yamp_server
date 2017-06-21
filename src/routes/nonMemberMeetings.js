import express from 'express';
import database from '../database';
import uuidV4 from 'uuid/v4';

const router = express.Router();

// create new non member meeting
router.post('/nonMemberMeetings', function(req, res, next){
    var newMeeting = {
        meetingId: uuidV4(),
        meetingName: req.body.meetingName,
        meetingDescription: req.body.meetingDescription,
        username: req.body.username,
        userEmail: req.body.userEmail,
        proposedDatesAndTimes: JSON.stringify(req.body.proposedDatesAndTimes)
    };
    return database.createNonMemberMeeting(newMeeting)
        .then(
            ()=>{
                res.json({meetingId: newMeeting.meetingId});
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get a list of all non member meetings
router.get('/nonMemberMeetings', function(req, res, next){
    return database.getAllNonMemberMeetings()
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

// delete all non member meetings
router.delete('/nonMemberMeetings', function(req, res, next){
    return database.deleteAllNonMemberMeetings()
        .then(
            ()=>{
                // delete all non member meeting invitations
                return database.deleteAllNonMemberInvitations()
                    .then(
                        ()=>{
                            res.json(true);
                        }
                    );
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get non member meeting with meetingId
router.get('/nonMemberMeetings/:meetingId', function(req, res, next){
    return database.getNonMemberMeetingById(req.params.meetingId)
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

// update non member meeting with meetingId
router.put('/nonMemberMeetings/:meetingId', function(req, res, next){
    var modifiedMeeting = {
        meetingId: req.params.userId,
        meetingName: req.body.meetingName,
        meetingDescription: req.body.meetingDescription,
        username: req.body.username,
        userEmail: req.body.userEmail,
        proposedDatesAndTimes: req.body.proposedDatesAndTimes
    };

    return database.updateNonMemberMeeting(modifiedMeeting)
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

// delete non member meeting with meetingId
router.delete('/nonMemberMeetings/:meetingId', function(req, res, next){
    return database.deleteNonMemberMeeting(req.params.meetingId)
        .then(
            ()=>{
                // delete all non member invitations associated with the deleted meeting
                return database.deleteAllNonMemberInvitationsByMeetingId(req.params.meetingId)
                    .then(
                        ()=>{
                            res.json(true);
                        }
                    )
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
