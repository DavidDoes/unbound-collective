'use strict';

const express = require('express');
const Challenge = require('../models/challenges');
const Submission = require('../models/submissions')
const jwtAuth = require('../middleware/jwt-auth');

const router = express.Router();

router.get('/', (req, res) => {
	Challenge.find()
		.then(challenge => {
			res.json(challenge.map(challenge => challenge.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.get('/:id', (req, res) => {
	Challenge.findById(req.params.id).then(challenge => {
		res.json(challenge.serialize());
	});
});

router.post('/', jwtAuth, function(req, res) {
	const requiredFields = ['title'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		console.log('hello from if statement');
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}
	const stringFields = ['title'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);
	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidatioNError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	return Challenge.create({
		title: req.body.title,
		creator: req.user._id
	}).then(challenge => {
		return res.status(201).json(challenge.serialize());
	});
});

router.put('/:id', (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		res.status(400).json({
			error: 'Request path id and request body id values must match'
		});
	}

	const updated = {};
	const updateableFields = ['title'];
	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Challenge.findOne({
		title: updated.title
	});
	Challenge.findByIdAndUpdate(
		req.params.id,
		{
			$set: updated
		},
		{
			new: true
		}
	)
		.then(updatedChallenge => {
			res.status(200).json({
				id: updatedChallenge.id,
				title: updatedChallenge.title
			});
		})
		.catch(err =>
			res.status(500).json({
				message: err
			})
		);
});
// FOR DEVELOPMENT ONLY - REMOVE DELETE
router.delete('/:id', (req, res) => {
	Challenge.remove({
		Challenge: req.params.id
	})
		.then(() => {
			Challenge.findByIdAndRemove(req.params.id).then(() => {
				res.status(204).json({
					message: 'success'
				});
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				err: 'Internal server error'
			});
		});
});


const ObjectId = require('mongodb').ObjectID;

const cloudinary = require('cloudinary');
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL;

const multer = require('multer');

const storage = multer.diskStorage({
	cloudinary: cloudinary,
	allowedFormats: ['jpg', 'jpeg', 'png']
});
const parser = multer({ storage: storage });

cloudinary.config({
	cloud_name: 'challenge-photos',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// New Submission for this Challenge
router.post('/:id/submissions', parser.single('image'), jwtAuth, (req, res) => {
	let public_id;

	cloudinary.uploader.upload(req.file.path, result => {
		req.body.image = result.secure_url;
    public_id = result.public_id;

		Submission.create({
			creator: req.user._id,
			challenge: ObjectId(req.params.id),
			cloudinary_id: public_id,
			image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
		}).catch(err => {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		});

		// change once Submissions route fully implemented:
		res.send(
			'photo uploaded to ' + CLOUDINARY_BASE_URL + 'image/upload/' + public_id
		);
	});
});

module.exports = router;
