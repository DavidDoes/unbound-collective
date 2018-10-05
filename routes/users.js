'use strict'

const express         = require('express')
const mongoose        = require("mongoose");

const User            = require('../models/users')
const Submission      = require('../models/submissions')
const jwtAuth         = require('../middleware/jwt-auth')
const router          = express.Router()

router.post('/', (req, res) => {
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

router.put('/:id', jwtAuth, (req, res, next) => {
  const {id} = req.params;
  const {newPassword} = req.body;
  const userId = req.user.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The provided `id` is invalid.')
    err.status = 400;
    return next(err);
  }

  if(!newPassword){
    const err = new Error('missing `newPassword` in request body.')
    err.status = 400;
    return next(err);
  }

  User.hashPassword(newPassword)
    .then(hash => {
      const updateUser = {
        userId, 
        password: hash
      }
      return User
        .findByIdAndUpdate(id, updateUser, {new: true})
          .then(result => {
            if(result){
              res.json(result);
            } else {
              next();
            }
          })
      .catch(err =>{
        if (err.code === 11000){
          err = new Error('Password must be more than 10 characters.');
          err.status = 400;
        }
        next(err);
      });
    });
});

router.delete('/:id', jwtAuth, (req, res, ext) => {
  const { id } = req.params;
  const userId = req.user.id;
  const password = req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The provided `id` is invalid.');
    err.status = 400;
    return next(err);
  }

  if(!password){
    const err = new Error('missing `password` in request body.')
    err.status = 400;
    return next(err);
  }

  const userRemovePromise = User.findOneAndRemove({_id: id, userId});

  const submissionUpdatePromise = Submission.updateMany(
    { creator: id, userId },
    { $pull: { creator: id }}
  );

  Promise.all([userRemovePromise, submissionUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id/submissions', jwtAuth, (req, res, next) => {
  const {id} = req.params;
  const creator = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The provided `id` is invalid.');
    err.status = 400;
    return next(err);
  }

  Submission
    .find({creator})
    .then(submissions => {
      res.json({
        submissions: submissions.map(
          (submissions) => submissions.serialize())
      }) // responds with empty array
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/:id/submissions', jwtAuth, (req, res) => {

});

// FOR DEVELOPMENT ONLY - DELETE REMOVE
router.get('/', (req, res) => {
  User
    .find()
    .then(user => {
      // res.json({
      //   user: user.map(
      //     (user) => user.serialize())
      // })
      res.send(user)
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })
  })

module.exports = router