'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var CommentSchema = mongoose.Schema({
  dateCreated: {type: Date, default: Date.now},
  // submission: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

var SubmissionSchema = mongoose.Schema({
  dateCreated: {type: Date, default: Date.now},
  // challenge: {type: String, required: true},
  challenge: {type: mongoose.Schema.Types.ObjectId, ref: 'Challenge'},
  // creator: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  comments: [CommentSchema]
})

SubmissionSchema.methods.serialize = function(){
  return {
    id: this._id,
    dateCreated: this.dateCreated,
    challenge: this.challenge,
    creator: this.creator,
    comments: this.comments
  }
}

CommentSchema.methods.serialize = function(){
  return {
    id: this._id,
    dateCreated: this.dateCreated,
    submission: this.submission,
    author: this.author
  }
}

const Submission = mongoose.model('Submission', SubmissionSchema)
const Comment = mongoose.model('Comment', CommentSchema)

module.exports = {Submission, Comment}