'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto'); // core js module, filename generator
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

mongoose.Promise = global.Promise;

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
// app.use('/', express.static(path.join(__dirname, 'public')));

// Mongo URI
app.use(methodOverride('_method')); 

const { DB_URL, PORT } = require('./config')

// NEW IN THIS BRANCH

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

let server;
let gfs;

function runServer(DB_URL, port = PORT){
  return new Promise((resolve, reject) => {

    mongoose.connect(DB_URL, err => {
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
      });
    })
    .once('open', () => {
      gfs = Grid(DB_URL, mongoose.mongo);
      gfs.collection('uploads');
      
    });
  });
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
  runServer(DB_URL) //change in production
    .catch(err => console.error(err))
}

module.exports = {app, runServer, closeServer}

// END NEW IN THIS BRANCH

module.exports = {
  app,
  // runServer,
  // closeServer,
  // DB_URL,
  // upload,
  // storage
}