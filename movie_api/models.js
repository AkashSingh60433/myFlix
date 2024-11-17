// models.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

// Add a static method to hash passwords
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Add an instance method to validate passwords
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Create models
const Movie = mongoose.model('Movie', movieSchema);
const Users = mongoose.model('User', userSchema);

// Export models
module.exports = { Movie, Users };
