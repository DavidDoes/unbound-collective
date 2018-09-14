'use strict'

require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

mongoose.Promise = global.Promise;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/', express.static(path.join(__dirname, 'public')));

const {router: usersRouter} = require('./users')
const {router: submissionsRouter} = require('./submissions')
const {router: challengesRouter} = require('./challenges')
const {router: uploadRouter} = require('./upload')

app.use('/users', usersRouter)
app.use('/submissions', submissionsRouter)
app.use('/challenges', challengesRouter)
app.use('/upload', uploadRouter)

const { DB_URL, PORT } = require('./config')

// NEW IN THIS BRANCH

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
    });
  });
};

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

// END NEW IN THIS BRANCH