import express from 'express';
import database from '../database';
import uuidV4 from 'uuid/v4';
import sendEmailInvitation from '../sendmail';

const router = express.Router();

// create new invitation
router.post('/invitations', function(req, res, next){
    var newInvitation = {
        invitation_id: uuidV4(),
        meeting_id: req.body.meetingId, 
        attendant_email: req.body.attendantEmail, 
        accepted_dates_and_times: req.body.acceptedDatesAndTimes
    };
    return database.createInvitation(newInvitation)
        .then(
            ()=>{
                res.json({invitationId: newInvitation.invitation_id});
                // send meeting invitation
                let meeting_invitation_link = 'http://localhost:3000/meeting-invitation/' + newInvitation.invitation_id;
                sendEmailInvitation(meeting_invitation_link, newInvitation.attendant_email);
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
router.get('/invitations', function(req, res, next){
    if(req.query.meeting_id){
        return database.getInvitationsByMeetingId(req.query.meeting_id)
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
    return database.getAllInvitations()
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

// delete all invitations
router.delete('/invitations', function(req, res, next){
    return database.deleteAllInvitations()
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

// get invitation with invitationId
router.get('/invitations/:invitationId', function(req, res, next){
    return database.getInvitationById(req.params.invitationId)
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

// update invitation with invitationId
router.put('/invitations/:invitationId', function(req, res, next){
    var modifiedInvitation = {
        invitation_id: req.params.invitationId,
        meeting_id: req.body.meetingId, 
        attendant_email: req.body.attendantEmail, 
        accepted_dates_and_times: JSON.stringify(req.body.acceptedDatesAndTimes)
    };

    return database.updateInvitation(modifiedInvitation)
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

// delete invitation with invitationId
router.delete('/invitations/:invitationId', function(req, res, next){
    return database.deleteInvitation(req.params.invitationId)
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
