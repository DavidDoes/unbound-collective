'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var ChallengeSchema = mongoose.Schema({
  title: {type: String, required: true},
  creator: {type: String, required: true},
  numSubmissions: Number,
  // dateCreated: Date
})

ChallengeSchema.methods.serialize = function(){
  return {
    title: this.title,
    creator: this.creator,
    numSubmissions: this.numSubmissions,
    // dateCreated: this.dateCreated
  }
}

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = {Challenge}