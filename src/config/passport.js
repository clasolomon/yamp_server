import LocalStrategy from 'passport-local';
import database from '../database';
import bcrypt from 'bcrypt-nodejs';
import uuidV4 from 'uuid/v4';

function generateHash(password) {  
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(password, encrypted) {  
    return bcrypt.compareSync(password, encrypted);
};

function configurePassport(passport) {  

    passport.serializeUser(function(user, done) {
        console.log("serializeUser");
        done(null, user.email);
    });

    passport.deserializeUser(function(id, done) {
        console.log("deserializeUser");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
        function(req, email, password, done) {
            return database.findUserByEmail(email)// check if the email is already in database
                .then(
                    function(user) {
                        if(user){
                            console.log('user in local-register:', user);
                            return done(null, {exists: true, email: email}); // return exists: true if the email is already in database
                        } else {
                            var newUser = {
                                user_id: uuidV4(),
                                user_name: req.body.user_name,
                                email: email,
                                password: generateHash(password)
                            };
                            return database.addUser(newUser).then(
                                function(){
                                    return done(null, newUser);
                                }
                            );
                        }    
                    })
                .catch(
                    function(err){
                        console.log(err);
                        return done(err);
                    }
                );
        }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
        function(req, email, password, done) {
        }));
};

module.exports = configurePassport;
