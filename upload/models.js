'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise

var StreamSchema = {
  function(gfs){
    gfs = Grid(DB_URL, mongoose.mongo)
    gfs.collection('uploads')
  }
};

const Stream = mongoose.model('Stream', StreamSchema);

module.exports = {Stream};