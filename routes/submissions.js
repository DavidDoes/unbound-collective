'use strict'

const express             = require('express')
const mongoose            = require('mongoose')

const router              = express.Router()

const Submission      = require('../models/submissions')
const Challenge       = require('../models/challenges')

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

// POST to /users/:id/submissions
// image should come from photo upload
router.post('/', (req, res, next) => {
  const { challenge, image } = req.body
  const creator = req.user.id // should be req.user.id if logged in
  const newSubmission = { creator, challenge, image }

  Promise.all([
    validateChallengeId(creator, challenge)
  ])
    .then(() => Submission.create(newSubmission))
    .then(result => { 
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result) // sets custom url 
    })
    .catch(err => {
      if (err === 'InvalidChallenge'){
        err = new Error('That challenge is invalid.')
        err.status = 400
      }
      next(err)
    })
})

module.exports = router