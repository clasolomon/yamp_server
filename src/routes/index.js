import express from 'express';
import passport from 'passport';
import _debug from 'debug';

const debug = _debug('routes:index');
const router = express.Router();

// NON_RESOURCE API
router.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('connect.sid');
  res.end();
});

router.post('/login', passport.authenticate('local-login'), (req, res) => {
  res.json(req.user);
});

// OTHERS
router.all('*', (req, res, next) => {
  debug('REQ USER:', req.user);
  debug('REQ SESSION:', req.session);
  next();
});

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
