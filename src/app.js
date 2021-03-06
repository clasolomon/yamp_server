import express from 'express';
import _debug from 'debug';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

import index from './routes/index';
import users from './routes/users';
import meetings from './routes/meetings';
import invitations from './routes/invitations';
import nonMemberMeetings from './routes/nonMemberMeetings';
import nonMemberInvitations from './routes/nonMemberInvitations';
import configurePassport from './config/passport';
import swaggerSpec from './config/swaggerSpec';

const app = express();
const debug = _debug('yamp:app');

function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PUT');
  res.header('Access-Control-Allow-Headers', 'content-type');
  next();
}

// view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'pug');

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(allowCrossDomain);

// passport configuration
app.use(session({ secret: 'shhsecret' }));
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// routes
app.use('/', index);
app.use('/', users);
app.use('/', meetings);
app.use('/', invitations);
app.use('/', nonMemberMeetings);
app.use('/', nonMemberInvitations);

// swagger documentation
// serve static swagger-ui-dist from node_modules
// do not forget to change the SwaggerUIBundle url to 'http://localhost:9000/api-docs.json'
// in index.html from swagger-ui-dist
app.use('/api-docs', express.static(getAbsoluteFSPath()));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  debug('app:', err);
    // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
