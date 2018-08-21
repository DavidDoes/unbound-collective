'use strict'

const express     = require('express')
const app         = express()
const mongoose    = require('mongoose')
mongoose.Promise  = global.Promise

const { 
  PORT, SUBMISSIONS_DB_URL, 
  USERS_DB_URL, 
  CHALLENGES_DB_URL
} = require('./config')

const {
  User, 
  Submission,
  Challenge
} = require('./models')

app.use(express.static('public'))
app.listen(process.env.PORT || 8080)



module.exports = app