'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/users');
const Submission = require('../models/submissions');
const Challenge = require('../models/challenges');
const jwtAuth = require('../middleware/jwt-auth');

const router = express.Router();

// create new user, check for fields
router.post('/', (req, res, next) => {
	const requiredFields = ['username'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}
	const stringFields = ['username'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);
	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	//if username and pass not trimmed, give error. Reject space values.
	const explicitlyTrimmedFields = ['username'];
	const nonTrimmedField = explicitlyTrimmedFields.find(
		field => req.body[field].trim() !== req.body[field]
	);

	if (nonTrimmedField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Cannot start or end with whitespace',
			location: nonTrimmedField
		});
	}

	const sizedFields = {
		username: {
			min: 5
		},
		password: {
			min: 10,
			max: 72
		}
	};

	const tooSmallField = Object.keys(sizedFields).find(
		field =>
			'min' in sizedFields[field] &&
			req.body[field].trim().length < sizedFields[field].min
	);
	const tooLargeField = Object.keys(sizedFields).find(
		field =>
			'max' in sizedFields[field] &&
			req.body[field].trim().length > sizedFields[field].max
	);
	//if incorrect length, return JSON object
	if (tooSmallField || tooLargeField) {
		const err = new Error(
			tooSmallField
				? `Must be at least ${sizedFields[tooSmallField].min} characters long`
				: `Must be at no longer than ${
						sizedFields[tooLargeField].max
				  } characters long`
		);
		err.location = tooSmallField || tooLargeField;
		err.status = 422;
		next(err);
	}

	let { username, password = '' } = req.body;

	return User.hashPassword(password)
		.then(hash => {
			const newUser = {
				username,
				password: hash
			};
			return User.create(newUser);
		})
		.then(user => {
			return res
				.status(201)
				.location(`/api/users/${user.id}`)
				.json(user);
		})
		.catch(err => {
			if (err.code === 11000) {
				err = new Error(
					'That username already exists. Please choose a different one.'
				);
				err.status = 400;
			}
			next(err);
		});
});

// change password; not implemented client-side
router.put('/:id', jwtAuth, (req, res, next) => {
	const { id } = req.params;
	const { newPassword } = req.body;
	const userId = req.user.id;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error('The provided `id` is invalid.');
		err.status = 400;
		return next(err);
	}

	if (!newPassword) {
		const err = new Error('missing `newPassword` in request body.');
		err.status = 400;
		return next(err);
	}

	User.hashPassword(newPassword).then(hash => {
		const updateUser = {
			userId,
			password: hash
		};
		return User.findByIdAndUpdate(id, updateUser, {
			new: true
		})
			.then(result => {
				if (result) {
					res.json(result);
				} else {
					next();
				}
			})
			.catch(err => {
				if (err.code === 11000) {
					err = new Error('Password must be more than 10 characters.');
					err.status = 400;
				}
				next(err);
			});
	});
});

// delete account; not implemented client-side
router.delete('/:id', jwtAuth, (req, res, next) => {
	const { id } = req.params;
	const userId = req.user.id;
	const password = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error('The provided `id` is invalid.');
		err.status = 400;
		return next(err);
	}

	if (!password) {
		const err = new Error('missing `password` in request body.');
		err.status = 400;
		return next(err);
	}

	const userRemovePromise = User.findOneAndRemove({
		_id: userId
	});

	const submissionUpdatePromise = Submission.updateMany(
		{
			creator: userId
		},
		{
			$unset: {
				creator: userId
			}
		}
	);

	Promise.all([userRemovePromise, submissionUpdatePromise])
		.then(() => {
			res.status(204).end();
		})
		.catch(err => {
			next(err);
		});
});

// get submissions associated with this user
router.get('/mysubmissions', jwtAuth, (req, res, next) => {
  Submission
    .find({ creator: req.user.id })
    .populate('challenge', 'title')
    
		.then(submissions => {
      console.log(submissions)
			res.json(submissions);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
});

// get challenges associated with this user
router.get('/mychallenges', jwtAuth, (req, res, next) => {
	Challenge.find({ creator: req.user.id })
		.then(challenges => {
			res.json(challenges);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
});

// get all users; not implemented client-side
router.get('/', (req, res) => {
	User.find()
		.then(user => {
			res.send(user);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
});

// get user by id
router.get('/:id', jwtAuth, (req, res, next) => {
	User.findById(req.user.id).then(data => {
		res.json(data);
	});
});

module.exports = router;
