'use strict'

const express       = require('express')
const bodyParser    = require('body-parser')
const {Creator}     = require('./models')
const router        = express.Router()
const jsonparser    = bodyParser.json()

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password']
  const missingFields = requiredFields.find(field => !(field in req.body))

  if (missingField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  }
  const stringField = ['username', 'password']
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

  //if username and pass not trimmed, give error. Reject space values.
  const explicitlyTrimmedFields = ['username', 'password']
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  )

  if (nonTrimmedField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    })
  }
})