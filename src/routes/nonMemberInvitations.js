import express from 'express';
import database from '../database';
import uuidV4 from 'uuid/v4';
import sendEmailInvitation from '../sendmail';

const router = express.Router();

// create new invitation
router.post('/nonMemberInvitations', function(req, res, next){
    var newInvitation = {
        invitationId: uuidV4(),
        meetingId: req.body.meetingId, 
        attendantEmail: req.body.attendantEmail, 
        acceptedDatesAndTimes: req.body.acceptedDatesAndTimes
    };
    return database.createNonMemberInvitation(newInvitation)
        .then(
            ()=>{
                res.json({invitationId: newInvitation.invitationId});
                // send meeting invitation
                let meeting_invitation_link = 'http://localhost:3000/meeting-invitation/' + newInvitation.invitationId;
                sendEmailInvitation(meeting_invitation_link, newInvitation.attendantEmail);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get a list of all invitations
router.get('/nonMemberInvitations', function(req, res, next){
    if(req.query.meetingId){
        return database.getNonMemberInvitationsByMeetingId(req.query.meetingId)
            .then(
                (invitations)=>{
                    res.json(invitations);
                }
            )
            .catch(
                (err)=>{
                    console.log(err);
                    res.sendStatus(500);
                }
            );
    }
    return database.getAllNonMemberInvitations()
        .then(
            (invitations)=>{
                res.json(invitations);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// delete all non member invitations
router.delete('/nonMemberInvitations', function(req, res, next){
    return database.deleteAllNonMemberInvitations()
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

// get non member invitation with invitationId
router.get('/nonMemberInvitations/:invitationId', function(req, res, next){
    return database.getNonMemberInvitationById(req.params.invitationId)
        .then(
            (invitation)=>{
                res.json(invitation);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// update non member invitation with invitationId
router.put('/nonMemberInvitations/:invitationId', function(req, res, next){
    var modifiedInvitation = {
        invitationId: req.params.invitationId,
        meetingId: req.body.meetingId, 
        attendantEmail: req.body.attendantEmail, 
        acceptedDatesAndTimes: JSON.stringify(req.body.acceptedDatesAndTimes)
    };

    return database.updateNonMemberInvitation(modifiedInvitation)
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

// delete non member invitation with invitationId
router.delete('/nonMemberInvitations/:invitationId', function(req, res, next){
    return database.deleteNonMemberInvitation(req.params.invitationId)
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
