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

// NON_RESOURCE API
router.get('/logout', function(req, res, next) {
    req.logout();
    res.clearCookie('connect.sid');
    res.end();
});

router.post('/login', passport.authenticate('local-login'), (req, res, next)=>{
    res.json(req.user);
});

// OTHERS
router.all('*', function(req, res, next){
    console.log('/////////////REQ USER:', req.user);
    console.log('/////////////REQ SESSION:', req.session);
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
