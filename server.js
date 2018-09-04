'use strict'

// https://www.youtube.com/watch?v=3f5Q9wDePzY&t=453s
// https://github.com/bradtraversy/mongo_file_uploads

// This app uses the following to get file from a form, upload to mongodb
// CRUD routes are handled with gridfs stream

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

// Mongo URI
// const mongoURI = 'mongodb://admin:password1@ds133252.mlab.com:33252/challenges-photos';

const { DB_URL, PORT } = require('./config')

// Create Mongo connection
const conn = mongoose.createConnection(DB_URL);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

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
// const upload = multer({ storage });

// Init uploaded
const upload = multer({
  // :storage is variable defined above
  storage: storage,
  limits: { fileSize: 10000000 }, // 10 MB - 10000000 bytes
  fileFilter: function(req, file, cb){
    checkFileType(file, cb); // defined below
  }
}).single('image') // name='' from form input

// Check file type
function checkFileType(file, cb){
  // Check for extensions allowed
  const filetypes = /jpeg|jpg|png|tif|tiff/;
  // Check ext - test() js function on file's original name
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 
  // Check mimetype - users can easily change extension.
  const mimetype = filetypes.test(file.mimetype); //see file object at bottom

  if (mimetype && extname){
    return cb(null, true)
  } else {
    cb('Error: Must be image of following mimetypes: jpeg, png, tiff');
    // ISSUE - this is not reached, but instead the error handler in post router
  }
}

// @route GET /
// @desc loads form
app.get('/',(req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// @route POST /upload
// @desc uploads file to db
// ('image') is from index.html name='' field on form input
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
    // Files exist
    return res.json(files); // send files array
  });
});

// @route GET /files/:filename
// @desc display one file 
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if(!file || file.length === 0){
      return res.status(404).json({
        err: 'No file exists.'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc display image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if(!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // Check if image
    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/tiff'){
      // Read output to browser
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

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`)
})
  .on('error', err => {
    mongoose.disconnect();
    reject(err);
})

module.exports = {
  app,
  // runServer,
  // closeServer,
  // DB_URL,
  upload,
  storage
}