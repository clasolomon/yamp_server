import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

import index from './routes/index';
import user from './routes/user';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import configurePassport from './config/passport';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(allowCrossDomain);

app.use(session({ secret: 'shhsecret' }));  
app.use(passport.initialize());  
app.use(passport.session());  

app.use('/', index);
app.use('/user', user);

configurePassport(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function allowCrossDomain(req, res, next) {
    console.log('allowCrossDomain')
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
module.exports = app;