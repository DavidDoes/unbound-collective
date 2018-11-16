'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Submission = require('../models/submissions');
const jwtAuth = require('../middleware/jwt-auth');

const cloudinary = require('cloudinary');

const router = express.Router();

// get all submissions; not implemented client-side
router.get('/', (req, res) => {
	Submission.find()
		.then(submission => {
			res.json(submission.map(submission => submission.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// delete users' own Submission, if authorized
router.delete('/:id', jwtAuth, (req, res) => {
  console.log('req.params.id: ', req.params.id);
	if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
		const err = new Error(
			'You do not have permission to delete this submission.'
		);
		err.status = 400;
		return next(err);
	}

	// remove from Cloudinary
	Submission.findById(req.params.id)
		.then(submission => {
      cloudinary.v2.uploader
        .destroy(submission.cloudinary_id, res => {
				  return res.status(204).end();
			});
		})
		.catch(err => {
			console.error(err);
			return res.status(500).end();
		})
		.then(() => {
			Submission.findByIdAndRemove(req.params.id).then(() => {
				return res.status(204).end();
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ err: 'Internal server error' });
		});
});

module.exports = router;
