const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const Models = require('./models.js');
const bcrypt = require('bcrypt');
const app = express();
const { movies } = require('./models');
const { Users } = require('./models');
const { check, validationResult } = require('express-validator');
const PORT = process.env.PORT || 8080;

const passport = require('passport');
require('./passport'); // Ensure Passport strategies are imported

app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(morgan('common')); // Log HTTP requests

// CORS setup
const cors = require('cors');
app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

// Import authentication routes
let auth = require('./auth')(app);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MYFLIXDB', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected"))
.catch(error => console.log(error));

// Routes

// 1. Sample protected endpoint (GET /movies)
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }), // JWT authentication middleware
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);

// 2. Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// 3. Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 4. Get list of all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 5. Get details of a single movie by title
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title });
    res.json(movie);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 6. Get details of a genre by name
app.get('/genres/:name', async (req, res) => {
  try {
    const genre = await Movie.findOne({ 'genre.name': req.params.name }, 'genre');
    res.json(genre.genre);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 7. Get details of a director by name
app.get('/directors/:name', async (req, res) => {
  try {
    const director = await Movie.findOne({ 'director.name': req.params.name }, 'director');
    res.json(director.director);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 8. Register a new user
app.post( '/users', [
    // Validation rules
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

//user id endpoint

app.put(
  '/users/:id',
  [
    // Validation rules
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // Return the updated document
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// 9. Update user info by username
app.put('/users/:username', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 10. Add a movie to a user's favorites
app.post('/users/:username/movies/:movieID', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { favoriteMovies: req.params.movieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 11. Remove a movie from a user's favorites
app.delete('/users/:username/movies/:movieID', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { favoriteMovies: req.params.movieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 12. Deregister a user by username
app.delete('/users/:username', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndRemove({ username: req.params.username });
    res.json(deletedUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});