'use strict'

// require dependencies
const express = require('express')
// create an express router object
const router = express.Router()
// require model
const User = require('./../models/user')
// require custom error handlers
const customErrors = require('./../../lib/custom_errors')
const crypto = require('crypto')
const passport = require('passport')
const handleChangePassword = customErrors.handleChangePassword
const handle404 = customErrors.handle404
const handlePasswordConfirmation = customErrors.handlePasswordConfirmation
const handlePasswordComparison = customErrors.handlePasswordComparison
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10

const requireToken = passport.authenticate('bearer', { session: false })
// POST /sign-up
router.post('/sign-up', (req, res, next) => {
  // get user credentials data from request
  const credentials = req.body.credentials
  // check that password and password_confirmation are the same
  Promise.resolve(handlePasswordConfirmation(credentials))
    // hash the password so its a secret when we save it
    .then(credentials => bcrypt.hash(credentials.password, bcryptSaltRounds))
    // save user email and hashedPassword to mongodb
    .then(hash => User.create({ email: credentials.email, hashedPassword: hash }))
    // if successful respond with 201 and user json
    .then(user => res.status(201).json({ user: user.toObject() }))
    // on error respond with 500 and error message
    .catch(next)
})

// POST /sign-sign
router.post('/sign-in', (req, res, next) => {
  // get the credentials from the request
  const credentials = req.body.credentials
  const email = credentials.email
  const password = credentials.password
  let user

  // find a user based on the email
  User.findOne({email: email})
    // if no user then send back an error message
    .then(handle404)
    // if we find a user
    .then(userDocument => {
      user = userDocument
      // compare the user pw in our db to the pw sent in credentials
      return bcrypt.compare(password, user.hashedPassword)
    })
    .then(handlePasswordComparison)
    // if pw does match
    .then(result => {
      // create token
      const token = crypto.randomBytes(16).toString('hex')
      // save token to mongodb
      user.token = token
      return user.save()
    })
    .then(user => {
      // return status 201, the email, and the new token
      res.status(201).json({ user: user.toObject() })
    })
    .catch(next)
})

// DELETE /sign-out
router.delete('/sign-out', requireToken, (req, res, next) => {
  // find the user by token
  const user = req.user
  user.token = crypto.randomBytes(16)
  // save to mongodb
  user.save()
  // return 204
    .then(() => res.sendStatus(204))
    .catch(next)
})

router.patch('/change-password', requireToken, (req, res, next) => {
  const passwords = req.body.passwords
  const newPassword = passwords.new
  const oldPassword = passwords.old
  const userId = req.user.id
  let user

  Promise.resolve(handleChangePassword(passwords))
    // find user by ID
    .then(passwords => User.findById(userId))
    // if no user then send back an error message
    .then(handle404)
    // compare db pw with request old pw
    .then(userDocument => {
      user = userDocument
      return bcrypt.compare(oldPassword, user.hashedPassword)
    })
    .then(handlePasswordComparison)
    // hash new password
    .then(() => bcrypt.hash(newPassword, bcryptSaltRounds))
    .then(hash => {
      // set and save the new hashed password in the DB
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => res.sendStatus(204))
    // pass any errors along to the error handler
    .catch(next)
})

module.exports = router
