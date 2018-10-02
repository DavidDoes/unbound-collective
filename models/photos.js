'use strict'

const mongoose            = require('mongoose')
const multer              = require('multer')
const cloudinary          = require('cloudinary')

mongoose.Promise = global.Promise

var PhotoSchema = mongoose.Schema({
  cloudinary_id: {type: String},
  url: {type: String}
})

PhotoSchema.methods.serialize = () => {
  return {
    cloudinary_id: this.req.params.id,
    url: this.url
  }
}

// PhotoSchema.methods.uploadImage = () => {
//   const storage = multer.diskStorage({
//     cloudinary: cloudinary,
//     allowedFormats: ['jpg', 'jpeg', 'png']
//   })
// }

const Photo = mongoose.model('Photo', PhotoSchema)

module.exports = Photo