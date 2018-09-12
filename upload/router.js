'use strict'

const express           = require('express')
const router            = express.Router()
const { upload, Photo }   = require('./setup')
// const bodyParser        = require('body-parser')
// const jsonParser        = bodyParser.json()

router.post('/', upload, (req, res) => {
  const photos = req.files.map((file) => {
    return {
      filename: file.filename,
      originalname: file.originalname
    }
  })
  Photo.insertMany(photos, (err, result) => {
    if(err) return res.sendStatus(404)
    res.json(result);
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
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if(!file || file.length === 0){
      return res.status(404).json({
        err: 'No file exists.'
      });
    }
    return res.json(file);
  });
});

router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if(!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/tiff'){
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Incorrect file type. Ensure using jpeg, png, or tiff.'
      });
    }
  });
});

router.delete('/files/:id', (req, res) => {
  gfs.remove({ 
    _id: req.params.id, 
    root: 'uploads'
  }, (err, gridStore) => {
    if(err){
      return res.status(404).json({ err: err });
    }
    res.redirect('/');
  })
});

if (require.main === module){
  runServer(DB_URL)
    .catch(err => console.error(err))
}

module.exports = {router}