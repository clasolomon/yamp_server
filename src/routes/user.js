import express from 'express';
import cors from 'cors';
var router = express.Router();

router.options('/', function(req, res, next){
    console.log('hello options');
    res.send();
});

/* POST add new user */
router.post('/', function(req, res, next) {
    console.log('hello post');
    res.send('respond with a resource');
});

module.exports = router;
