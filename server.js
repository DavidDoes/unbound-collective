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

const {Stream} = require('upload/models.js');

const app = express();

mongoose.Promise = global.Promise;

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
// app.use('/', express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method')); 

const { DB_URL, PORT } = require('./config')

// NEW IN THIS BRANCH

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

let server;
// let gfs;

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
      })
      // also uncomment line 35
      // 
      // .once('open', () => {
      //   // Init stream
      //   gfs = Grid(DB_URL, mongoose.mongo);
      //   gfs.collection('uploads');
      // });
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

// Create storage object engine
const storage = new GridFsStorage({
  url: DB_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // generate random name with 16 characters
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads' // collection 
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  // :storage is variable defined above
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image')

function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|tif|tiff/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 
  const mimetype = filetypes.test(file.mimetype); //see file object at bottom

  if (mimetype && extname){
    return cb(null, true)
  } else {
    cb('Error: Must be image of following mimetypes: jpeg, png, tiff');
  }
}

// @route GET /
// @desc loads form
// app.get('/',(req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });

app.use('/', express.static(path.join(__dirname, 'public')));


// @route POST /upload
// @desc uploads file to db
app.post('/upload', upload, (req, res) => {
//  res.json({ file: req.file });
  res.redirect('/');
});

// @route GET /files
// @desc display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files exist
    if(!files || files.length === 0){
      return res.status(404).json({
        err: 'No files exist.'
      });
    }
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc display one file 
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if(!file || file.length === 0){
      return res.status(404).json({
        err: 'No file exists.'
      });
    }
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc display image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if(!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/tiff'){
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Incorrect file type. Ensure using jpeg, png, or tiff.'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ 
    _id: req.params.id, 
    root: 'uploads'
  }, (err, gridStore) => {
    if(err){
      return res.status(404).json({ err: err });
    }
    res.redirect('/');
  })
});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {app, runServer, closeServer}

// END NEW IN THIS BRANCH