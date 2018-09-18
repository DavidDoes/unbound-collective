'use strict'

const {Upload} = require('./scripts')
const {router} = require('./router')
const {Photo}  = require('./models')

module.exports = {Photo, Upload, router}

