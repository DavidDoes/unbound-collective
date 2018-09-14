'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var SubmissionSchema = mongoose.Schema({
  dateCreated: Date, 
  challenge: {type: String, required: true},
  creator: {type: String, required: true},
  photo: {data: Buffer, contentType: String}
})

SubmissionSchema.methods.serialize = function(){
  return {
    id: this._id,
    dateCreated: this.dateCreated,
    challenge: this.challenge,
    creator: this.creator,
  }
}

const Submission = mongoose.model('Submission', SubmissionSchema)

module.exports = {Submission}