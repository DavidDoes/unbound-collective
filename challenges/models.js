'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: String, required: true},
  description: String,
  numSubmissions: Number
  // dateCreated: Date
})

ChallengeSchema.methods.serialize = function(){
  return {
    // id: this._id,
    title: this.title,
    creator: this.creator,
    description: this.description,
    numSubmissions: this.numSubmissions
    // dateCreated: this.dateCreated
  }
}

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = {Challenge}