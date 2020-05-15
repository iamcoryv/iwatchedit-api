'use strict'

// require dependencies
const express = require('express')
const passport = require('passport')
// create an express router object
const router = express.Router()
// require book model
const User = require('./../models/user')
// require custom error handlers
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
// const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { movie: { title: '', text: 'foo' } } -> { movie: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// This shows all the movies that are listed to the user
router.get('/movies/', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  User.findById(req.user)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "movie" JSON
    .then(movie => res.status(200).json({ movie: movie.movies.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.get('/movies/:id', requireToken, (req, res, next) => {
  // get the movie ID from the params
  const id = req.params.id
  console.log(id)
  // get the user thanks to requireToken
  const user = req.user
  console.log(user)
  // find the user's movie
  // return the movie
  User.findOne(user)
    .then(handle404)
    .then(movie => res.status(200).json({ movie: movie.movies.id(id).toObject() }))
    .catch(next)
})

// Create: POST /movies save the book data
router.post('/movies', (req, res, next) => {
  // get movie data from request
  const movie = req.body.movie
  // get movie id from data
  const userId = movie.user_id
  // find book by ID
  User.findById(userId)
    .then(user => {
      // add comment and save book
      user.movies.push(movie)
      return user.save()
    })
    // if successful respond with 201 and book json
    .then(book => res.status(201).json({ book: book.toObject() }))
    // on error respond with 500 and error message
    .catch(next)
})

module.exports = router
