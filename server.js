'use strict'

const express     = require('express')
const mongoose    = require('mongoose')
const morgan      = require('morgan')
const app         = express()
mongoose.Promise  = global.Promise

const { 
  PORT,
  TEST_DB_URL //change in production
} = require('./config')

const {router: usersRouter} = require('./users')
const {router: submissionsRouter} = require('./submissions')
// const {router: challengesRouter} = require('./challenges')

app.use('/users', usersRouter)
app.use('/submissions', submissionsRouter)
// app.use('/challenges', challengesRouter)

app.use(express.static('public'))
app.use(morgan('common'))

app.use(function(req, res, next){
  res.status(404).json({ message: 'Not found' })
})

let server

function runServer(testDbUrl, port = PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(testDbUrl, err => {
      if (err){
        return reject(err)
      }
      server = app.listen(port, () =>{
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
  runServer(TEST_DB_URL)
    .catch(err => console.error(err))
}

module.exports = {app, runServer, closeServer}