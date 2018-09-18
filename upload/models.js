'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var PhotoSchema = mongoose.Schema({
  image: {type: String}
})

PhotoSchema.methods.serialize = () => {
  return {
    image: this.image
  }
}

const Photo = mongoose.model('Photo', PhotoSchema)

module.exports = {Photo}