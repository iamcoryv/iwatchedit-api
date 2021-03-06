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
// this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// this is middleware that will remove blank fields from `req.body`, e.g.
// { movie: { title: '', text: 'foo' } } -> { movie: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// must pass a token for route to work
const requireToken = passport.authenticate('bearer', { session: false })

// GET all movies, this shows all the movies that are listed to the user
router.get('/movies/', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  User.findById(req.user)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "movie" JSON
    .then(movie => res.status(200).json({ movie: movie.movies.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// GET a specific movie
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

// Create a new movie
router.post('/movies', requireToken, (req, res, next) => {
  // get movie data from request
  const movie = req.body.movie
  // get movie id from data
  const user = req.user
  // find book by ID
  User.findById(user)
    .then(user => {
      // add comment and save book
      user.movies.push(movie)
      return user.save()
    })
    // if successful respond with 201 and book json
    .then(movie => res.status(201).json({ movie: movie.toObject() }))
    // on error respond with 500 and error message
    .catch(next)
})

// UPDATE a user's movie
router.patch('/movies/:id', requireToken, removeBlanks, (req, res, next) => {
  // get movie id from data
  // const userId = movie.user_id
  const user = req.user
  // find book by ID
  const movieData = req.body.movie
  console.log(movieData)
  User.findById(user)
    .then((user) => {
      const movie = user.movies.id(req.params.id) // returns a matching subdocument
      movie.set(movieData) // updates the address while keeping its schema
      return user.save() // saves document with subdocuments and triggers validation
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE a user's movie
router.delete('/movies/:id', requireToken, (req, res, next) => {
  // get movie id from data
  // const userId = movie.user_id
  const user = req.user
  // find book by ID
  User.findById(user)
    .then((user) => {
      const movie = user.movies.id(req.params.id) // returns a matching subdocument
      movie.remove()
      user.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
