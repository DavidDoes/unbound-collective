'use strict';

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { DB_URL } = require('../config')

mongoose.Promise = global.Promise

// var gfsSchema = Grid(DB_URL, mongoose.mongo);

var gfsSchema = mongoose.Schema({ //Grid?
  DB_URL : String
});

// var StreamSchema = {
//   function(gfs){
//     gfs = Grid(DB_URL, mongoose.mongo)
//     gfs.collection('uploads')
//   }
// };

const gfs = mongoose.model('gfs', gfsSchema);

module.exports = {gfs};