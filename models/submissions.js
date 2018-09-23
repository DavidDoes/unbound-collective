'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var SubmissionSchema = mongoose.Schema({
  dateCreated: Date, 
  challenge: {type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  photo: {type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true}
})

SubmissionSchema.methods.serialize = function(){
  return {
    id: this._id,
    dateCreated: this.dateCreated,
    challenge: this.challenge,
    creator: this.creator,
    photo: this.photo
  }
}

const Submission = mongoose.model('Submission', SubmissionSchema)

module.exports = {Submission}