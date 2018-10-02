'use strict'

const express             = require('express')
const mongoose            = require('mongoose')
const Submission          = require('../models/submissions')
const Challenge           = require('../models/challenges')

const router              = express.Router()

const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

const multer = require('multer')

const storage = multer.diskStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpg', 'jpeg', 'png']
})
const parser = multer({ storage: storage })

cloudinary.config({
  cloud_name: 'challenge-photos',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.post('/', parser.single('image'), (req, res) => {
  let public_id

  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    public_id = result.public_id
    console.log(result.public_id)
    console.log(public_id)

    Submission
      .create({
        cloudinary_id: public_id,
        image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
    }).catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    })

    // change once Submissions route fully implemented: 
    res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + public_id)
  })
})

router.get('/', (req, res) => {
  Submission
    .find()
    .then(submission => {
      res.json({
        submission: submission.map(
          (submission) => submission.serialize())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })
  })



module.exports = router