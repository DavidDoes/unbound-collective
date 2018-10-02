'use strict'

const mongoose            = require('mongoose')
const multer              = require('multer')
const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

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

PhotoSchema.methods.uploadImage = () => {
  const storage = multer.diskStorage({
    cloudinary: cloudinary,
    allowedFormats: ['jpg', 'jpeg', 'png']
  })

  const parser = multer({ storage: storage })
  cloudinary.config({
    cloud_name: 'challenge-photos',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  cloudinary.uploader.upload(req.file.path, parser, (result) => {
    req.body.image = result.secure_url
    public_id = result.public_id
  })
  return { 
    cloudinary_id: public_id,
    url: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
  }
}

const Photo = mongoose.model('Photo', PhotoSchema)

Photo.create(cloudinary_id, url)

module.exports = Photo