'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, 
  photo: {type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true} 
})

ChallengeSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    creator: this.creator,
    photo: this.thumbnail
  }
}

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = Challenge