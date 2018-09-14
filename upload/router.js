'use strict'

const express           = require('express')
const router            = express.Router()
const { upload, Photo }   = require('./scripts')
// const bodyParser        = require('body-parser')
// const jsonParser        = bodyParser.json()

router.post('/', upload, (req, res) => {
  console.log(req.file);
  Photo.create({ data: req.file.buffer, contentType: req.file.mimetype })
    .then(function(data){
      console.log(data)
    })
    .catch((err) => {
      console.log(err)
    })
  res.send('image uploaded')
})

router.get('/files', (req, res, next) => {
  Photo.findById(photo, (err, item) => {
    if(err) return next(err)
    res.contentType(item.photo.contentType)
    res.send(item.photo.data)
  })
    return res.json(photo);
});

router.get('/files/:filename', (req, res) => {

});

router.get('/image/:filename', (req, res) => {

});

router.delete('/files/:id', (req, res) => {

});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}