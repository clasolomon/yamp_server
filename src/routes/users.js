import express from 'express';
import database from '../database';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';

function generateHash(password) {  
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const router = express.Router();

// create new user
router.post('/users', function(req, res, next){
    var newUser = {
        user_id: uuidV4(),
        user_name: req.body.username,
        email: req.body.email,
        password: generateHash(req.body.password)
    };

    return database.getUserByEmail(req.body.email)
        .then(
            (user)=>{
                if(user){
                    res.status(400).json({ error: 'Resource already exists!' });
                } else {
                    return database.createUser(newUser)
                        .then(
                            ()=>{
                                res.json({userId: newUser.user_id, email: newUser.email});
                            }
                        );
                }
            }
        ).catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// get a list of all users
router.get('/users', function(req, res, next){
    if(req.query.email){
        return database.getUserByEmail(req.query.email)
            .then(
                (user)=>{
                    if(user) delete user.password;
                    res.json(user);
                }
            )
            .catch(
                (err)=>{
                    console.log(err);
                    res.sendStatus(500);
                }
            );
    }
    return database.getAllUsers()
        .then(
            (users)=>{
                // TODO  delete password for all users before adding to response if(user) delete user.password;
                res.json(users);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// delete all users
router.delete('/users', function(req, res, next){
    return database.deleteAllUsers()
        .then(
            ()=>{
                // delete all meetings 
                return database.deleteAllMeetings()
                    .then(
                        ()=>{
                            // delete all invitations
                            return database.deleteAllInvitations()
                                .then(
                                    ()=>{
                                        res.json(true);
                                    }
                                );
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

// get user with user_id
router.get('/users/:userId', function(req, res, next){
    return database.getUserById(req.params.userId)
        .then(
            (user)=>{
                res.json(user);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
                res.sendStatus(500);
            }
        );
});

// update user with userId
router.put('/users/:userId', function(req, res, next){
    var modifiedUser = {
        user_id: req.params.userId,
        user_name: req.body.username,
        email: req.body.email,
    };

    if(req.body.password){
        modifiedUser.password = generateHash(req.body.password);
    }

    return database.updateUser(modifiedUser)
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

// delete user with userId
router.delete('/users/:userId', function(req, res, next){
    return database.deleteUser(req.params.userId)
        .then(
            ()=>{
                // get all the meetings created by this user
                return database.getAllMeetingsByUserId(req.params.userId)
                    .then(
                        (meetings)=>{
                            // this array contains the promises for each meeting deletion
                            let promises = [];
                            if(meetings){
                                meetings.map((meeting, index)=>{
                                    // delete all the invitations to each meeting
                                    promises[index] = database.deleteAllInvitationsByMeetingId(meeting.meeting_id)
                                        .then(
                                            ()=>{
                                                // finally delete the meeting
                                                return database.deleteMeeting(meeting.meeting_id);
                                            }
                                        )
                                        .catch(
                                            (err)=>{
                                                console.log(err);
                                                res.sendStatus(500);
                                            }
                                        );
                                });
                            }
                            // only after all meetings and associated invitations have been deleted send a response
                            return Promise.all(promises).then(
                                ()=>{
                                    res.json(true);
                                }
                            );
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

module.exports = router;
