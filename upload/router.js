'use strict'

const express           = require('express')
const router            = express.Router()
const { upload }        = require('./scripts')
const { Photo }         = require('./models')
const cloudinary        = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

// GET BY ID Route only for development
router.get('/:id', (req, res) => {
  Photo
    .findById(req.params.id)
    .then(photo => {
      res.send(photo)
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    })
})
//

router.post('/', upload, (req, res) => {
  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    req.body.id = result.public_id

    Photo
      .create({
        cloudinary_id: result.public_id,
        image: CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id
    })

    // change once Submissions route fully implemented: 
    res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id)
    // add following lines when auth implemented
    // req.body.image.creator = { 
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })
})

router.delete('/:id', (req, res) => {
  // delete from cloudinary
  // https://cloudinary.com/documentation/node_image_upload#update_and_delete_images
  Photo
    .findById(req.params.id)
    .then(photo => {
      cloudinary.v2.uploader
      .destroy(photo.cloudinary_id, (err, result) => {
        console.log(result, err)
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    })    
  // delete from db
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

router.get('/', (req, res) => {
  Photo
    .find()
    .then(photo => {
      res.send(photo)
      console.log(photo[0].cloudinary_id)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'something went terribly wrong' })
    })
})

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}