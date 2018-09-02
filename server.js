'use strict'

const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')
const crypto = require('crypto')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
// const methodOverride = require('method-override')
// const bodyParser = require('body-parser')
const multer = require('multer');


const app = express()

mongoose.Promise = global.Promise

const {
  PORT,
  DB_URL
} = require('./config')

const {
  router: usersRouter
} = require('./users')
const {
  router: submissionsRouter
} = require('./submissions')
const {
  router: challengesRouter
} = require('./challenges')
const {
  router: uploadRouter
} = require('./upload')

app.use('/users', usersRouter)
app.use('/submissions', submissionsRouter)
app.use('/challenges', challengesRouter)
app.use('/upload', uploadRouter)

app.use(express.static('public'))
app.use(morgan('common'))

app.use(function (req, res, next) {
  res.status(404).json({
    message: 'Not found'
  })
})

let server;
// Init gfs
let gfs;

function runServer(dbUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(dbUrl, err => {
      if (err) {
        return reject(err)
      }
      server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`)
          resolve()
          server.once('open', () => { // file handling for server-side
            // Init stream
            gfs = Grid(server.db, mongoose.mongo);
            gfs.collection('uploads');
          });
        })
        .on('error', err => {
          mongoose.disconnect()
          reject(err)
        })
    })
  })
}

// Create storage engine
const storage = new GridFsStorage({
  url: DB_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // generate name for file, 16 characters:
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({
  storage
});

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server')
      server.close(err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

if (require.main === module) {
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {
  app,
  runServer,
  closeServer,
  server,
  DB_URL,
  upload,
  storage
}