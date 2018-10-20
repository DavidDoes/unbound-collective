'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Submission = require('../models/submissions');
const jwtAuth = require('../middleware/jwt-auth');

const router = express.Router();

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

// Delete user's Submission
// router.delete('/:id', jwtAuth, (req, res, next) => {
// 	const creator = req.user.id;
// 	const id = req.params.id;

// 	if (!mongoose.Types.ObjectId.isValid(creator)) {
// 		const err = new Error(
// 			'You do not have permission to delete this submission.'
// 		);
// 		err.status = 400;
// 		return next(err);
// 	}

// 	if (!mongoose.Types.ObjectId.isValid(id)) {
// 		const err = new Error('The provided `id` is invalid.');
// 		err.status = 400;
// 		return next(err);
// 	}

// 	Submission.findById(id)
// 		.then(image => {
//       cloudinary.v2.uploader.destroy(image.cloudinary_id)
//       .then(() => {
//         Submission.findByIdAndRemove(id)
//         .then((res) => {
//           res.status(204).json({
//              message: 'successfully deleted' 
//             })
// 				})
// 			})
// 		})
// 		.catch(err => {
// 			next(err);
// 		});
// });

router.delete('/:id', jwtAuth, (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
		const err = new Error(
			'You do not have permission to delete this submission.'
		);
		err.status = 400;
		return next(err);
	}

	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		const err = new Error('The provided `id` is invalid.');
		err.status = 400;
		return next(err);
	}

  Submission
    .findById(req.params.id)
    .then(image => {
      cloudinary.v2.uploader
      .destroy(image.cloudinary_id, (err) => {
        res.status(204).json({ message: 'Successfully deleted from Cloudinary' })
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    })
    .then(() => {
      Submission
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({ message: 'Successfully deleted from database' })
      })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ err: 'Internal server error' })
  })
})

module.exports = router;
