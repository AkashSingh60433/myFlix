const express = require('express');
const morgan = require('morgan');
const app = express();

// Middleware to log all requests using Morgan
app.use(morgan('common'));

// Serve static files from the public directory
app.use(express.static('public'));

// Movie data
const movies = [
  { title: 'Inception', director: 'Christopher Nolan', year: 2010 },
  { title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
  { title: 'Interstellar', director: 'Christopher Nolan', year: 2014 },
  { title: 'Parasite', director: 'Bong Joon-ho', year: 2019 },
  { title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
  { title: 'The Godfather', director: 'Francis Ford Coppola', year: 1972 },
  { title: 'Fight Club', director: 'David Fincher', year: 1999 },
  { title: 'Pulp Fiction', director: 'Quentin Tarantino', year: 1994 },
  { title: 'Schindler\'s List', director: 'Steven Spielberg', year: 1993 },
  { title: 'The Shawshank Redemption', director: 'Frank Darabont', year: 1994 }
];

// GET route to return top 10 movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// Default route for "/"
app.get('/', (req, res) => {
  res.send('Welcome to My top 10 movie API!');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Check the terminal for error details.');
});

// Listen on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});