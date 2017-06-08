import express from 'express';
import passport from 'passport';
import database from '../database';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';
import sendEmailInvitation from '../sendmail';

function generateHash(password) {  
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/nonMemberMeeting/:invitation_id', function(req, res, next){
    return database.getNonMemberMeetingDataAndMeetingInvitationData(req.params.invitation_id)
        .then((data)=>{
            res.json(data);
        })
        .catch(
            function(err){
                console.log(err);
                res.sendStatus(500);
            }
        );
});


router.get('/nonMemberAcceptedDatesAndTimes/:meeting_id', function(req, res, next){
    return database.getAllAcceptedDatesAndTimes(req.params.meeting_id)
        .then((data)=>{
            res.json(data);
        })
        .catch(
            function(err){
                console.log(err);
                res.sendStatus(500);
            }
        );
});

router.post('/register', registerUser);
router.post('/submitAcceptedDatesAndTimes', changeAcceptedDatesAndTimes);

router.post('/login', passport.authenticate('local-login'), (req, res, next)=>{
    res.json(req.user);
});

router.post('/create-meeting', createMeeting);

function changeAcceptedDatesAndTimes(req, res, next){
    console.log(req.body.invitation_id);
    console.log(JSON.stringify(req.body.accepted_dates_and_times));
    return database.updateAcceptedDatesAndTimes(req.body.invitation_id, JSON.stringify(req.body.accepted_dates_and_times))
        .then(
            function() {
                res.end();
            })
        .catch(
            function(err){
                console.log(err);
                res.sendStatus(500);
            }
        );
}

function registerUser(req, res, next){
    return database.findUserByEmail(req.body.email)// check if the email is already in database
        .then(
            function(user) {
                if(user){
                    res.json({isNewUser:false, email: user.email});
                } else {// if the user is not in the database then create a new user
                    var newUser = {
                        user_id: uuidV4(),
                        user_name: req.body.user_name,
                        email: req.body.email,
                        password: generateHash(req.body.password)
                    };
                    return database.addUser(newUser).then(
                        function(){
                            res.json({isNewUser:true, email: newUser.email});
                        }
                    );
                }    
            })
        .catch(
            function(err){
                console.log(err);
                res.sendStatus(500);
            }
        );
}

function createMeeting(req, res, next){
    let input = {
        meeting_id: uuidV4(),
        user_name: req.body.user_name,
        user_email: req.body.user_email,
        meeting_name: req.body.meeting_name,
        meeting_description: req.body.meeting_description,
        proposed_dates_and_times: JSON.stringify(req.body.datesAndTimes),
        invite_emails: JSON.stringify(req.body.inviteEmails)
    };

    let meeting_admin_link = 'http://localhost:3000/meeting/' + input.meeting_id;

    return database.addNonMemberMeeting(input)        
        .then(function(value){
            // add participants to database
            req.body.inviteEmails.forEach((currentEmail)=>{
                let invitationData = {
                    invitation_id: uuidV4(),
                    meeting_id: input.meeting_id,
                    atendant_email: currentEmail,
                    accepted_dates_and_times: JSON.stringify(new Array(req.body.datesAndTimes.length))
                }

                database.addNonMemberMeetingInvitation(invitationData);
                let meeting_invitation_link = 'http://localhost:3000/meeting-invitation/' + invitationData.invitation_id;

                // send invitations
                sendEmailInvitation(input.user_name, input.meeting_name, meeting_invitation_link, currentEmail);
            });

            res.end();
        })
        .catch(
            function(err){
                console.log(err);
                res.sendStatus(500);
            }
        );
}


module.exports = router;
