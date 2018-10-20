'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var ChallengeSchema = mongoose.Schema({
	title: { type: String, required: true },
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	cloudinary_id: { type: String, required: true },
	image: { type: String, required: true }
});

ChallengeSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
    creator: this.creator,
    cloudinary_id: this.cloudinary_id,
		image: this.image
	};
};

const Challenge = mongoose.model('Challenge', ChallengeSchema);

module.exports = Challenge;
