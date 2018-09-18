'use strict';

const express = require('express');
const crypto = require('crypto'); // core js module, filename generator
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); // core node module
const methodOverride = require('method-override');
const cloudinary = require('cloudinary')


mongoose.Promise = global.Promise

const app = express();
app.use(methodOverride('_method')); 
app.use('/', express.static(path.join(__dirname, 'public')));

const { DB_URL } = require('../config')

// // Schema
// const PhotoSchema = mongoose.Schema({
//   data: Buffer, contentType: String
// })

// // Model
// const Photo = mongoose.model('Photo', PhotoSchema)

// Create storage object engine
const storage = multer.diskStorage({
  filename: function(req, file, callback){
    callback(null, Date.now() + file.originalname)
  }
});

// Accept image files only
// const imageFilter = function(req, file, cb){
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//     return cb(new Error('Ensure file is JPEG or PNG.'), false)
//   }
//   cb(null, true)
// }

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

cloudinary.config({
  cloud_name: 'challenge-photos',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = { upload }