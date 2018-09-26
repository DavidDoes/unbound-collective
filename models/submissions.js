'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var SubmissionSchema = mongoose.Schema({
  challId: {type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  cloudinary_id: String,
  image: String
})

SubmissionSchema.methods.serialize = function(){
  return {
    id: this._id,
    challId: this.challenge,
    creator: this.creator,
    cloudinary_id: this.cloudinary_id,
    image: this.photo
  }
}

const Submission = mongoose.model('Submission', SubmissionSchema)

module.exports = Submission