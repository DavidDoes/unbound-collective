'use strict'

const express           = require('express')
const router            = express.Router()
const { upload, Photo }   = require('./scripts')
const cloudinary = require('cloudinary')

// const bodyParser        = require('body-parser')
// const jsonParser        = bodyParser.json()

router.post('/', upload, (req, res) => {
  // console.log(req.file);
  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    req.body.id = result.public_id
    // req.body.image.creator = { //auth not yet implemented
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })
  Photo.create(
    req.body.image, (err, photo) => {
      if(err){
        res.send('error', err.message)
        return res.redirect('back')
      }
      res.redirect('/upload/' + photo.id)
    }
  )
  console.log(req.body)
})

router.get('/files', (req, res, next) => {

});

router.get('/files/:filename', (req, res) => {

});

router.get('/:id', (req, res) => {
  // Photo
  //   .findById(req.params.id)
  //   .then(
  //     console.log(req.params)
  //   )

});

router.delete('/files/:id', (req, res) => {

});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}