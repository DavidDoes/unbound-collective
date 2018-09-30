'use strict'

const express             = require('express')
const router              = express.Router()
const Photo               = require('../models/photos')
const Submission          = require('../models/submissions')
const cloudinary          = require('cloudinary')
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL

const multer = require('multer')
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

router.post('/', parser.single('image'), (req, res) => {
  let public_id

  cloudinary.uploader.upload(req.file.path, (result) => {
    req.body.image = result.secure_url
    public_id = result.public_id
    console.log(result.public_id)
    console.log(public_id)

    Photo
      .create({
        cloudinary_id: public_id,
        image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
    }).catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    })

    // change once Submissions route fully implemented: 
    res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + public_id)

    const challenge = req.body.challenge
    const photo = Photo.id
    const creator = req.user.id // should be req.user.id if logged in
    const newSubmission = { creator, challenge, photo }

    Submission
      .create(newSubmission)
    console.log(Submission)
    // add following lines when auth implemented
    // req.body.image.creator = { 
    //   id: req.user._id,
    //   username: req.user.username
    // }
  })
})


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

// router.post('/', parser, (req, res) => {
//   cloudinary.uploader.upload(req.file.path, (result) => {
//     req.body.image = result.secure_url
//     req.body.id = result.public_id
//     console.log(result.public_id)
//     console.log(req.body.id)

//     Photo
//       .create({
//         cloudinary_id: result.public_id,
//         image: CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id
//     })
//     // change once Submissions route fully implemented: 
//     res.send('photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + req.body.id)
//   })
//   .catch(err => {
//     console.error(err)
//     res.status(500).json({ error: 'Internal server error' })
//   })
// })

router.delete('/:id', (req, res) => {
  // delete from cloudinary
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

module.exports = router