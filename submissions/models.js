'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var SubmissionSchema = mongoose.Schema({
  // dateCreated: {type: Date, required: true, default: Date.now},
  challenge: {type: String, required: true},
  creator: {type: String, required: true},
  comments: String
})

var CommentSchema = mongoose.Schema({
  // dateCreated: {type: Date, require: true},
  submission: {type: String, required: true},
  author: {type: String, required: true},
})

SubmissionSchema.methods.serialize = function(){
  return {
    id: this._id,
    // dateCreated: this.dateCreated,
    challenge: this.challenge,
    creator: this.creator,
    comments: this.comments
  }
}

CommentSchema.methods.serialize = function(){
  return {
    id: this._id,
    // dateCreated: this.dateCreated,
    submission: this.submission,
    author: this.author
  }
}

const Submission = mongoose.model('Submission', SubmissionSchema)
const Comment = mongoose.model('Comment', CommentSchema)

module.exports = {Submission, Comment}