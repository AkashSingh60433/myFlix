const jwtSecret = 'your_jwt_secret'; // Use the same key from passport.js
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Ensure Passport is configured

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // The username being encoded in the JWT
    expiresIn: '7d', // JWT expires in 7 days
    algorithm: 'HS256', // Secure hashing algorithm
  });
};

// Login endpoint
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Login failed',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
