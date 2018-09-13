'use strict';

const express = require('express');
const crypto = require('crypto'); // core js module, filename generator
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path'); //core node module
const methodOverride = require('method-override');

mongoose.Promise = global.Promise

const app = express();
app.use(methodOverride('_method')); 
app.use('/', express.static(path.join(__dirname, 'public')));

const { DB_URL } = require('../config')

// Schema
const PhotoSchema = mongoose.Schema({
  img: { data: Buffer, contentType: String }
})

// Model
const Photo = mongoose.model('Photo', PhotoSchema)

mongoose.connection.on('open', () => {
  const photo = new Photo

  photo.img.data = fs.readFile(storage, (err, data) => {
    if (err) {
      throw err
    } else {
      console.log(data)
      content = data
    }
  }) //where is path defined?
  photo.img.contentType = 'image/png' || 'image/tiff' || 'image/jpeg'
  photo.save( (err) => {
    if(err) throw err
    console.error('saved photo to mongo')
  })
})

// Create storage object engine
const storage = multer.memoryStorage({ // was new GridFsStorage
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

module.exports = { upload, Photo }