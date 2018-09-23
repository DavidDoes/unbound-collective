'use strict'

const express             = require('express')
const bodyParser          = require('body-parser')
const router              = express.Router()
const jsonParser          = bodyParser.json()

const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

const { Submission }      = require('../models/submissions')
const { Challenge }       = require('../models/challenges')
const { Photo }           = require('../models/photos')

router.post('/', jsonParser, function(req, res){
  // cloudinary.uploader.upload(req.file.path, (result) => {
  //   req.body.image = result.secure_url
  //   req.body.id = result.public_id

  const requiredFields = ['creator', 'challenge', 'image']
  const missingField = requiredFields.find(field => !(field in req.body))

  if (missingField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  }
  const stringFields = ['creator', 'challenge']
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  )
  if (nonStringField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    })
  }

  let creator = req.creator.id
  let {challenge, image} = req.body
  let newSubmission = {creator, challenge, image}

  return Submission.create(newSubmission)
  .then(submission => {
    return res.status(201).json(submission.serialize())
  })
})

router.put('/:id', jsonParser, (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    })
  }

  const updated = {}
  const updateableFields = ['challenge']
  updateableFields.forEach(field => {
    if(field in req.body){
      updated[field] = req.body[field]
    }
  })

  Submission
    .findOne({ challenge: updated.challenge })
      Submission
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedSubmission => {
          res.status(200).json({
            id: updatedSubmission.id,
            creator: updatedSubmission.creator,
            challenge: updatedSubmission.challenge
          })
        })
        .catch(err => res.status(500).json({ message: err }))
})

router.delete('/:id', (req, res) => {
  Submission
    .remove({ Submission: req.params.id })
    .then(() => {
      Submission
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({ message: 'success' })
        })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ err: 'Internal server error' })
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
// })

module.exports = {router}