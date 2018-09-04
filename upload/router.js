'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
// const {Upload}        = require('./models')
const DB_URL          = require('../config')
 
const router          = express.Router()
const app             = express()
const jsonParser      = bodyParser.json()

// Middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))

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
const upload = multer({ storage });

// POST /upload route
// upload file to db
// 'image' comes from form `name` property
router.post('/', upload.single('image'), (req, res) => {
  console.log('POST /index')
  res.json({file: req.file});
});

router.get('/files', (req, res) => {
  gfs.find().toArray((err, files) => {
    // Check if files exist
  })
});

module.exports = {router}