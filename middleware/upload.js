'use strict';

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinaryStorage = require("multer-storage-cloudinary");
const path = require('path'); // core node module
const methodOverride = require('method-override');
const cloudinary = require('cloudinary')

// THIS MIDDLEWARE IS NO LONGER REFERENCED

mongoose.Promise = global.Promise

const app = express();
app.use(methodOverride('_method')); 
app.use('/', express.static(path.join(__dirname, 'public')));

cloudinary.config({
  cloud_name: 'challenge-photos',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Create storage object engine
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpg', 'jpeg', 'png']
})

const parser = multer({ storage: storage }).single('image')

module.exports = { parser }