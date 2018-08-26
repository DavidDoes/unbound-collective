'use strict'

const express       = require('express')
const bodyParser    = require('body-parser')
const {Challenge}  = require('./models')
const router        = express.Router()
const jsonParser    = bodyParser.json()

router.post('/', jsonParser, function(req, res){
  const requiredFields = ['title', 'creator', 'numSubmissions']
  const missingField = requiredFields.find(field => !(field in req.body))

  if (missingField){
    console.log('hello from if statement')
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  }
  const stringFields = ['title', 'creator']
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  )
  if (nonStringField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidatioNError', 
      message: 'Incorrect field type: expected string',
      location: nonStringField
    })
  }

  let {title, creator = ''} = req.body
  
  return Challenge.create({
    title,
    creator
  })
  .then(challenge => {
    return res.status(201).json(challenge.serialize())
  })
})


//FOR TESTING ONLY
//do not use this method in production
router.get('/', (req, res) => {
  return Challenge.find()
    .then(challenges => res.json(challenges.map(challenge => challenge.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error' }))
})

module.exports = {router}