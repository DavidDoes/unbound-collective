'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},  
  thumbnail: String,
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }]
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