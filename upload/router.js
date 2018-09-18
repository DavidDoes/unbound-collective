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
    res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id)
    // change next line once plugged into submissions

    // res.redirect(CLOUDINARY_BASE_URL + 'image/upload/' + result.public_id)

    // req.body.image.creator = { //auth not yet implemented
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })
})

router.delete('/:id', (req, res) => {
  res.send('photo deleted')
});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}