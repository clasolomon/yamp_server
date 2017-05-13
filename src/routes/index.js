import express from 'express';
import passport from 'passport';
import database from '../database';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';

function generateHash(password) {  
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/register', registerUser);

router.post('/login', passport.authenticate('local-login'), (req, res, next)=>{
    res.json(req.user);
});


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
                res.sendStatus(500);
            }
        );
}




module.exports = router;
