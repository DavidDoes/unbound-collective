'use strict'

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const jwtAuth = require('./middleware/jwt-auth')

const app = express()

const usersRouter = require('./routes/users')
const submissionsRouter = require('./routes/submissions')
const challengesRouter = require('./routes/challenges')
const authRouter = require('./routes/auth')

mongoose.Promise = global.Promise

// Middleware
app.use(express.json())
app.use(express.static('public'))

// Public Routes
app.use('/api', authRouter)
app.use('/api/users', usersRouter) 
app.use('/api/submissions', submissionsRouter)
app.use('/api/challenges', challengesRouter) 

// Protected Routes
app.use('/api/users/:id/submissions', jwtAuth, submissionsRouter) 
app.use('/api/users/:id', jwtAuth, usersRouter)
app.use('/api/challenge/:id', submissionsRouter)

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