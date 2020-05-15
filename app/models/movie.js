'use strict'

const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  thoughts: {
    type: String,
    required: true
  },
  rewatch: {
    type: Boolean
  },
  favorite: {
    type: Boolean
  },
  rating: {
    type: Number,
    max: 5,
    min: 1
  }
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})
module.exports = movieSchema
