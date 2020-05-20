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
    type: Boolean,
    required: false
  },
  favorite: {
    type: Boolean,
    required: false
  },
  rating: {
    type: Number,
    max: 5,
    min: 1,
    required: false
  }
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})
module.exports = movieSchema
