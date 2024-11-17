const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

const Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'testUsername',
      passwordField: 'testPassword',
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          console.log('Incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        console.log('Login successful');
        return callback(null, user);
      } catch (error) {
        console.log(error);
        return callback(error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
          return callback(null, false);
        }
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);
