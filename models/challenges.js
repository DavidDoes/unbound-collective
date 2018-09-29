'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  thumbnail: String 
  // change to mongoose type when Photo passed to Submission, then in client-side, get image of a Submission to be the thumbnail
})

ChallengeSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    creator: this.creator,
    thumbnail: this.thumbnail
  }
}

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = Challenge