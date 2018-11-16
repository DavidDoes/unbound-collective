'use strict';

const chai = require('chai'),
	chaiHttp = require('chai-http'),
	mongoose = require('mongoose'),
	jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { TEST_DB_URL, JWT_SECRET, JWT_EXPIRY, TEST_PORT } = require('../config');

const User = require('../models/users'),
	Challenge = require('../models/challenges'),
	Submission = require('../models/submissions');

const seedUsers = require('../test-seed/users');
const seedChallenges = require('../test-seed/challenges');
const seedSubmissions = require('../test-seed/submissions');

const expect = chai.expect;
chai.use(chaiHttp);

function tearDownDb() {
	return new Promise((resolve, reject) => {
		console.warn('Deleting database');
		mongoose.connection
			.dropDatabase()
			.then(result => resolve(result))
			.catch(err => reject(err));
	});
}

describe('Submissions resource', function() {
	let user = {};
	let token;

	before(function() {
		return runServer(TEST_DB_URL, TEST_PORT);
	});

	beforeEach(function() {
		return Promise.all([
			User.insertMany(seedUsers),
			User.createIndexes(),
			Submission.insertMany(seedSubmissions),
			Submission.createIndexes(),
			Challenge.insertMany(seedChallenges),
			Challenge.createIndexes()
		])
    .then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      return user;
    })
    .catch(err => {
    });
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('GET /api/submissions', function() {
		it('Should return all existing submissions', function() {
			const dbPromise = Submission.find();
			const apiPromise = chai.request(app).get('/api/submissions');

			return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(data.length);
			});
		});

		it('Should return submissions with correct fields', function() {
			const dbPromise = Submission.find();
			const apiPromise = chai.request(app).get('/api/submissions');

			return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an('array');
				expect(res.body.length).to.equal(data.length);

				res.body.forEach(function(submission, i) {
					expect(submission).to.have.all.keys(
						'id',
						'challenge',
						'creator',
						'cloudinary_id',
						'image'
					);
					expect(submission.id).to.equal(data[i].id);
					expect(submission.title).to.equal(data[i].title);
				});
			});
		});
	});

	describe('POST Submission to /api/challenges/:id/submissions', function() {
		it('Should add new submission with valid data', function() {
			this.timeout(15000);

			return Challenge.findOne().then(data => {
				return chai
					.request(app)
          .post(`/api/challenges/${data.id}/submissions`)
					.set('Authorization', `Bearer ${token}`)
					.field('Content-Type', 'multipart/form-data')
					.field('creator', user.id)
					.field('challenge', data.id)
					.attach('image', './test/test-image.png')

					.then(res => {
						expect(res).to.have.status(201);
						expect(res).to.be.json;
						expect(res.body).to.be.an('object');
						expect(res.body).to.have.keys(
							'id',
							'creator',
							'challenge',
							'cloudinary_id',
							'image'
						);
						return Submission.findById(res.body.id);
					});
			});
		});
  });

	describe('DELETE Submission /api/submissions/:id', function() {
		it('Should delete Submission of id', function() {
      const userId = user.id;
      let submission;

			return Submission.findOne({ creator: userId })
				.then(_submission => {
          submission = _submission;

					return chai
						.request(app)
						.delete(`/api/submissions/${submission.id}`)
						.set('Authorization', `Bearer ${token}`);
				})
				.then(res => {
					expect(res).to.have.status(204);
					expect(res.body).to.be.empty;
					return Submission.findById(submission.id);
				})
				.then(submission => {
					expect(submission).to.be.null;
				});
    });
    
    it('Should respond 500 for invalid id', function() {
      const invalidId = 'invalid-id';

      return chai
        .request(app)
        .delete(`/api/submissions/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(500);
        })
    })

    it('Should respond 401 unauthorized', function() {
      const badToken = 'bad-token';
      let submission;

			return Submission.findOne()
				.then(_submission => {
          submission = _submission;

					return chai
						.request(app)
						.delete(`/api/submissions/${submission.id}`)
            .set('Authorization', `Bearer ${badToken}`)
            .then(res => {
              expect(res).to.have.status(401);
            })
        });
    });
  });
  
});
