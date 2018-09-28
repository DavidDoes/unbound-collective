'use strict'

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const jwtAuth = require('./middleware/jwt-auth')

const app = express()

const usersRouter = require('./routes/users')
const submissionsRouter = require('./routes/submissions')
const challengesRouter = require('./routes/challenges')
const mySubmissionsRouter = require('./routes/my-submissions')
const uploadRouter = require('./routes/photos')
const authRouter = require('./routes/auth')

mongoose.Promise = global.Promise

// Middleware
app.use(bodyParser.json())
// app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))

// Public Routes
// DON'T USE IN DEVELOPMENT:
app.use('/users', usersRouter)
app.use('/submissions', submissionsRouter)
// also POSt to public submissions route?
app.use('/challenges', challengesRouter)
app.use('/photos', uploadRouter)
app.use('/api', authRouter)
// above - rewrite w/ API/

// Protected Routes
app.use('/auth/users', usersRouter)
app.use('/auth/users/:id/submissions', submissionsRouter)
// above - rewrite > users/:id/submissions

const { DB_URL, PORT } = require('./config')

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

let server;

function runServer(DB_URL, port = PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(DB_URL, { useNewUrlParser: true }, err => {
      if (err){
        return reject(err)
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`)
        resolve()
      })
      .on('error', err => {
        mongoose.disconnect()
        reject(err)
      })
    })
  })
}

function closeServer(){
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server')
      server.close(err => {
        if(err){
          return reject(err)
        }
        resolve()
      })
    })
  })
}

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {app, runServer, closeServer}