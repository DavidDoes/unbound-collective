'use strict'

const express             = require('express')
const router              = express.Router()

const Submission      = require('../models/submissions')

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
// })

module.exports = router