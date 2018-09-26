const express             = require('express')
const mongoose            = require('mongoose')
const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

const Submission      = require('../models/submissions')

const router = express.Router()

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

function validateChallengeId(challenge, creator){
  if(challenge === undefined){
    return Promise.resolve()
  }
  if(!mongoose.Types.ObjectId.isValid(challenge)){
    const err = new Error('The `challenge` is invalid.')
    err.status = 400
    return Promise.reject(err)
  }
  return Challenge.count({ _id: challenge, creator})
    .then(count => {
      if (count === 0){
        const err = new Error('The `challenge` is invalid.')
        err.status = 400
        return Promise.reject(err)
      }
    })
}

router.get('/', (req, res, next) => {
  const { challenge } = req.query
  const creator = req.creator.id

  let filter = { creator }

  if(challenge){
    filter.challenge = challenge
  }

  Submission
    .find(filter)
      .sort('-created_at')
      .then(results => {
        res.json(results)
    })
    .catch(err => {
      next(err)
    })
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params
  const creator = req.user.id

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('This `id` is invalid')
    err.status = 400
    return next()
  }

  Submission
    .findOne({ _id: id, creator })
    .then(result => {
      if(result){
        res.json(result)
      } else {
        next()
      }
    })
    .catch(err => {
      next(err)
    })
})

router.post('/', parser.single('image'), (req, res, next) => {
  req.body.image = result.secure_url
  public_id = result.public_id

  const { challenge } = req.body
  const creator = req.user.id

  const newSubmission = { 
    challenge, 
    creator,
    cloudinary_id: public_id,
    image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
  }

  Promise.all(validateChallengeId(challenge, creator))
    .then(() => 
    Submission.create(newSubmission))
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result)
    })
    .catch(err => {
      if(err === 'InvalidChallenge'){
        err = new Error('The Challenge is invalid.')
        err.status = 400
      }
      next(err)
    })
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params.id
  const creator = req.user.id

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is invalid.')
    err.status = 400
    return next(err)
  }

  Submission
    .findOneAndRemove({ _id: id, creator })
      .then(() => {
        res.status(204).end()
      })
      .catch(err => {
        next(err)
      })
})

module.exports = router