'use strict'

const express           = require('express')
const router            = express.Router()
const { upload, Photo } = require('./scripts')
const cloudinary        = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

// const bodyParser        = require('body-parser')
// const jsonParser        = bodyParser.json()

router.post('/', upload, (req, res) => {
  // console.log(req.file);
  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    req.body.id = result.public_id
    res.redirect(CLOUDINARY_BASE_URL + '/image/upload/' + result.public_id)
    console.log(result.public_id)
    // req.body.image.creator = { //auth not yet implemented
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })

  // Photo.create(
  //   req.body.image, (err, photo) => {
  //     if(err){
  //       res.send('error', err.message)
  //     }
  //     res.redirect('/upload/' + photo.id)
  //   }
  // )
  // console.log(req.body)
})

router.get('/:id', (req, res) => {
  res.send('hello from upload/:id')
  cloudinary.image(public_id)
});

router.delete('/:id', (req, res) => {
  res.send('photo deleted')
});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}