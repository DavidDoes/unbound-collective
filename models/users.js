'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

mongoose.Promise = global.Promise

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username || ''
  }
}

UserSchema.methods.validatePassword = function(password){
  return bcrypt.compare(password, this.password)
}

UserSchema.statics.hashPassword = function(password){
  return bcrypt.hash(password, 10)
}

const User = mongoose.model('User', UserSchema);

module.exports = User