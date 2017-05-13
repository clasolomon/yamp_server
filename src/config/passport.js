import LocalStrategy from 'passport-local';
import database from '../database';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';

function validPassword(password, encrypted) {  
    return bcrypt.compareSync(password, encrypted);
};

function configurePassport(passport) {  

    passport.serializeUser(function(user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function(id, done) {
        return database.findUserById(id)
            .then(
                function(user) {
                    return done(null, user);
                }
            )
            .catch(
                function(err){
                    return done(err);
                }
            );
    });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
        function(req, email, password, done) {
            return database.findUserByEmail(email)//search for user's email in database
                .then(
                    function(user) {
                        if(!user){// if user's email is not found
                            return done(null, false);
                        }
                        if(!validPassword(password, user.password)){// if password doesn't match
                            return done(null, false);
                        }
                        delete user['password'];
                        return done(null, user);
                    })
                .catch(
                    function(err){
                        return done(err);
                    }
                );
        }));
}

module.exports = configurePassport;
