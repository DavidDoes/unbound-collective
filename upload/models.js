'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var UploadSchema = mongoose.Schema({
  filename: { type: String }
})

const Upload = mongoose.model('Upload', UploadSchema)

module.exports = {Upload}