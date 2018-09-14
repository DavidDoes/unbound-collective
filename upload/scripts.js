'use strict';

const express = require('express');
const crypto = require('crypto'); // core js module, filename generator
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); // core node module
const methodOverride = require('method-override');

mongoose.Promise = global.Promise

// gfs and upload logic
const app = express();
app.use(methodOverride('_method')); 
app.use('/', express.static(path.join(__dirname, 'public')));

const { DB_URL } = require('../config')

// Schema
const PhotoSchema = mongoose.Schema({
  data: Buffer, contentType: String
})

// Model
const Photo = mongoose.model('Photo', PhotoSchema)

// Create storage object engine
const storage = multer.memoryStorage();

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