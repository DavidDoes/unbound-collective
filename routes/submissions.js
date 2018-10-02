'use strict'

const express             = require('express')
const mongoose            = require('mongoose')
const Submission          = require('../models/submissions')
const Challenge           = require('../models/challenges')

const router              = express.Router()

const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL
const multer              = require('multer')

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

function validateChallengeId(challenge, creator) {
  if (challenge === undefined) {
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(challenge)) {
    const err = new Error('That `challenge` is not a valid ObjectId.')
    err.status = 400;
    return Promise.reject(err)
  }
}
// POST to /users/:id/submissions
router.post('/', parser.single('image'), (req, res, next) => {
  Submission
    .create()
    // .then(result => { 
      // res.location(`${req.originalUrl}/submission/${result.id}`).status(201).json(result) // redirects to custom url 
    // })
    .catch(err => {
      if (err === 'InvalidChallenge'){
        err = new Error('That challenge is invalid.')
        err.status = 400
      }
      res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + public_id)
    })
    // next(err)
    // })
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