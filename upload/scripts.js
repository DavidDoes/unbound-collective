'use strict';

const express = require('express');
const path = require('path');
const crypto = require('crypto'); // core js module, filename generator
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override'); //for DELETE w/o AJAX - REWRITE TO USE AJAX W/ GFS?

mongoose.Promise = global.Promise

// gfs and upload logic
const app = express();
app.use(methodOverride('_method')); 
app.use('/', express.static(path.join(__dirname, 'public')));

// const conn = mongoose.createConnection('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]', options);

const { DB_URL, PORT } = require('../config')

// Create Mongo connection
const conn = mongoose.connect(DB_URL, PORT );

let gfs;

conn.once('open', () => {
  console.log(conn.db);
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage object engine
const storage = readFile({
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

module.exports = { gfs, upload }