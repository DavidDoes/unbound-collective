// 'use strict'

// const mongoose = require('mongoose')

// var challengeSchema = mongoose.Promise({
//   title: 'string',
//   dateCreated: date,
//   description: 'string',
//   submissions: number
// })

// var commentSchema = mongoose.Schema({ content: 'string' })

// var submissionSchema = mongoose.Schema({
//   dateCreated: date,
//   challenge: 'string',
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   comments: [commentSchema]
// })

// submissionSchema.pre('find', function(next){
//   this.populate('User') //merge data from Creators collection on db
//   next()
// })

// submissionSchema.pre('findOne', function(next){
//   this.populate('User') //Creator in sep collection, merge to get serialize to work below
//   next()
// })

// //virtual = attribute used, but not persisted to mongodb
// submissionSchema.virtual('userName').get(function(){
//   if (!this.user){ 
//     return null
//   }
//   return `${this.user.userName}`
// })

// //encodes string to URL notation
// submissionSchema.methods.serialize = function(){
//   return {
//     id: this._id,
//     dateCreated: this._dateCreated,
//     challenge: this._challenge,
//     creator: this._userName,
//     comments: this._comments
//   }
// }

// //mongoose looks for plural version
// var User = mongoose.model('User', userSchema)
// var Challenge = mongoose.model('Challenge', challengeSchema)
// const Submission = mongoose.model('Submission', submissionSchema)

// module.exports = {User, Challenge, Submission}