const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Users } = require('./models');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log('Incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
          }
          console.log('Finished');
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.error(error);
            return callback(error);
          }
        });
    }
  )
);
