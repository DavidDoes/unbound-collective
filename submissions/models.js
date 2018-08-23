'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

mongoose.Promise = global.Promise

var SubmissionSchema = mongoose.Schema({
  ObjectId = mongoose.Types.ObjectId,
  dateCreated: {type: Date, required: true, defautl: Date.now},
  challenge: {type: String, required: true},
  creator: {type: String, required: true},
  comments: [CommentSchema]
})

var CommentSchema = mongoose.Schema({
  ObjectId = mongoose.Types.ObjectId,
  dateCreated: {type: Date, require: true},
  submission: {type: String, required: true},
  creator: {type: String, required: true},
})

const Submission = mongoose.model('Submission', SubmissionSchema)
const Comment = mongoose.model('Comment', CommentSchema)

module.exports = {Submission, Comment}