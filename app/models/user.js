'use strict'
const mongoose = require('mongoose')
const movieSchema = require('./movie')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  movies: [movieSchema],
  token: String
}, {
  timestamps: true,
  toObject: {
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})
module.exports = mongoose.model('User', userSchema)
