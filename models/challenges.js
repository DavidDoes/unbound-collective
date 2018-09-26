'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: String, required: true},
  dateCreated: Date,
  thumbnail: String
})

ChallengeSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    creator: this.creator,
    dateCreated: this.dateCreated,
    thumbnail: this.thumbnail
  }
}

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = Challenge