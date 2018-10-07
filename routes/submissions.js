'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Submission = require('../models/submissions');
const jwtAuth = require('../middleware/jwt-auth');

const router = express.Router();

router.get('/', (req, res) => {
	Submission.find()
		.then(submission => {
			res.json({
				submission: submission.map(submission => submission.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

const cloudinary = require('cloudinary');

cloudinary.config({
	cloud_name: 'challenge-photos',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Delete user's Submission
router.delete('/:id', jwtAuth, (req, res, next) => {
  const creator = req.user._id;
  const id = req.params.id;
  console.log(id)

	if (!mongoose.Types.ObjectId.isValid(creator)) {
		const err = new Error('You do not have permission to delete this submission.');
		err.status = 400;
		return next(err);
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error('The provided `id` is invalid.');
		err.status = 400;
		return next(err);
	}

	Submission.findById(id)
		.then(image => {
			cloudinary.v2.uploader.destroy(image.cloudinary_id).then(() => {
				Submission.findByIdAndRemove({ _id: id, creator }).then(() => {
					res.status(204).json({
						message: 'Successfully deleted from database'
					});
				});
			});
		})
		.catch(err => {
			next(err);
		});
});

module.exports = router;
