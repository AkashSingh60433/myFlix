const express = require('express');
const mongoose = require('mongoose');
const { Movie, User } = require('./models'); // Import models from models.js
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MYFLIXDB', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected"))
.catch(error => console.log(error));

// Routes

// 1. Get list of all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 2. Get details of a single movie by title
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title });
    res.json(movie);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 3. Get details of a genre by name
app.get('/genres/:name', async (req, res) => {
  try {
    const genre = await Movie.findOne({ 'genre.name': req.params.name }, 'genre');
    res.json(genre.genre);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 4. Get details of a director by name
app.get('/directors/:name', async (req, res) => {
  try {
    const director = await Movie.findOne({ 'director.name': req.params.name }, 'director');
    res.json(director.director);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 5. Register a new user
app.post('/users', async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: new Date(req.body.birthday)
    });
    res.json(newUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// 6. Update user info by username
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

// 7. Add a movie to a user's favorites
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

// 8. Remove a movie from a user's favorites
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

// 9. Deregister a user by username
app.delete('/users/:username', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndRemove({ username: req.params.username });
    res.json(deletedUser);
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
