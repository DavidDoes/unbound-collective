'use strict'

const express           = require('express')
const router            = express.Router()
const { upload }        = require('./scripts')
const { Photo }         = require('./models')
const cloudinary        = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

router.post('/', upload, (req, res) => {
  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    req.body.id = result.public_id

    Photo.create({
      image: CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id
    })
    .then(
      photo => res.json(photo.map(photo => photo.serialize()))
    )
    // change once Submissions route fully implemented: 
    res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id)
    // add following lines when auth implemented
    // req.body.image.creator = { 
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })
})

router.delete('/:id', (req, res) => {
  Photo
    .remove({ Photo: req.params.id })
    .then(() => {
      Photo
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({ message: 'successfully deleted' })
        })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ err: 'Internal server error' })
    })
})

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}