import express from 'express';
import passport from 'passport';
import database from '../database';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/', (req, res, next)=>{
    database.addUser(req.body);
    res.end('User added successfully!');
});

/*
router.post('/register', (req, res, next)=>{
    passport.authenticate('local-register', function(err, user){
        res.json(user).end();
    })(req, res, next);
});

router.post('/login', (req, res, next)=>{
    passport.authenticate('local-login', function(err, user){  
    })(req, res);
});
*/

router.post('/register', passport.authenticate('local-register'), (req, res, next)=>{
    console.log('req.user:', req.user);
    res.json(req.user).end();
});

router.post('/login', passport.authenticate('local-login'), (req, res, next)=>{
});

module.exports = router;
