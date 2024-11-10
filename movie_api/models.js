// models.js
const mongoose = require('mongoose');

// Define the Genre schema (embedded in Movies)
const genreSchema = new mongoose.Schema({
  name: String,
  description: String
});

// Define the Director schema (embedded in Movies)
const directorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  birthYear: Number,
  deathYear: Number
});

// Define the Movies schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  releaseYear: Number,
  genre: genreSchema,
  director: directorSchema,
  description: String,
  rating: Number,
  imageURL: String,
  featured: Boolean
});

// Define the Users schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Create models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Export models
module.exports = { Movie, User };
