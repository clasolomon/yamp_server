import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt-nodejs';
import database from '../database';

function validPassword(password, encrypted) {
  return bcrypt.compareSync(password, encrypted);
}

function configurePassport(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  passport.deserializeUser((id, done) => database.getUserById(id)
        .then(
            user => done(null, user),
        )
        .catch(
            err => done(err),
        ));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
        // search for user's email in database
        (req, email, password, done) => database.getUserByEmail(email)
        .then(
            (user) => {
              if (!user) { // if user's email is not found
                return done(null, false);
              }
              if (!validPassword(password, user.password)) { // if password doesn't match
                return done(null, false);
              }
                // if user is found and password matches
              return done(null, {
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
              });
            })
        .catch(
            err => done(err),
        ),
    ),
    );
}

module.exports = configurePassport;
