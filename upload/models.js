'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var PhotoSchema = mongoose.Schema({
  cloudinary_id: {type: String},
  image: {type: String}
})

PhotoSchema.methods.serialize = () => {
  return {
    cloudinary_id: this.req.params.id,
    image: this.image
  }
}

const Photo = mongoose.model('Photo', PhotoSchema)

module.exports = {Photo}