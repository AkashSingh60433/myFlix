const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// In-memory arrays for sample data
const movies = [
  { title: 'Inception', description: 'Dream invasion', genre: 'Sci-Fi', director: 'Christopher Nolan', imageUrl: 'https://inception.jpg', featured: true },
  { title: 'The Matrix', description: 'Reality vs simulation', genre: 'Sci-Fi', director: 'Lana Wachowski', imageUrl: 'https://matrix.jpg', featured: true },
];
const genres = { 'Sci-Fi': { description: 'Science Fiction' } };
const directors = { 'Christopher Nolan': { bio: 'British-American director', birthYear: 1970, deathYear: null } };
const users = [
  {
    username: "example123",
    email: "example123@example.com",
    favorites: ["Inception", "The Matrix"] // Movies the user has added to favorites
  }
];

// Routes

//READ
app.get('/movies', (req, res) => {
  res.json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  movie ? res.json(movie) : res.status(404).send('Movie not found');
});

//READ
app.get('/genres/:name', (req, res) => {
  const genre = genres[req.params.name];
  genre ? res.json(genre) : res.status(404).send('Genre not found');
});

//READ
app.get('/directors/:name', (req, res) => {
  const director = directors[req.params.name];
  director ? res.json(director) : res.status(404).send('Director not found');
});

// CREATE - Register a new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuidv4(); // Assign a unique ID to each user
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Users need names');
  }
});

// READ - Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// UPDATE - Update user info by ID
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    res.send(`User with ID ${req.params.id} updated`);
  } else {
    res.status(404).send('User not found');
  }
});

// DELETE - Deregister a user by ID
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.send(`User with ID ${req.params.id} deregistered`);
  } else {
    res.status(404).send('User not found');
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
