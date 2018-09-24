'use strict'

const express         = require('express')
const bodyParser      = require('body-parser')
const jsonParser      = bodyParser.json()
const { User }        = require('../models/users')
const router          = express.Router()

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username']
  const missingField = requiredFields.find(field => !(field in req.body))

  if (missingField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  }
  const stringFields = ['username']
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
  const explicitlyTrimmedFields = ['username']
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
  
  const sizedFields = {
    username: {
      min: 5
    },
    password: {
      min: 10,
      max: 72
    }
  }

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
//if incorrect length, return JSON object
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at no longer than ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField 
    });
  }

  let {username, password = ''} = req.body

  return User.hashPassword(password)
    .then(hash => {
      const newUser = {
        username, 
        password: hash
      }
      return User.create(newUser)
    })
    .then(user => {
      return res.status(201).location(`/api/users/${user.id}`).json(user)
    })
    .catch(err => {
      if (err.code === 11000){
        err = new Error('The username already exists. Please choose a new one.')
        err.status = 400
      }
    })
})

// router.put('/:id', jsonParser, (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       error: 'Request path id and request body id values must match'
//     });
//   }

//   const updated = {};
//   const updateableFields = ['username', 'password'];
//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });

//   User
//     .findOne({ username: updated.username })
//     .then(user => {
//       if(user) {
//         const message = `Username is already taken`;
//         console.error(message);
//         return res.status(400).send(message);
//       }
//       else {
//         User
//           .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
//           .then(updatedUser => {
//             res.status(200).json({
//               id: updatedUser.id,
//               username: `${updatedUser.username}`,
//             });
//           })
//           .catch(err => res.status(500).json({ message: err }));
//       }
//     });
// });

router.delete('/:id', (req, res) => {
  User
    .remove({ User: req.params.id })
    .then(() => {
      User
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

// FOR DEVELOPMENT ONLY
router.get('/', (req, res) => {
  User
    .find()
    .then(user => {
      res.json({
        user: user.map(
          (user) => user.serialize())
      })
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })
  })

module.exports = {router}