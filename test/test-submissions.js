'use strict';

const chai      = require('chai'),
	    chaiHttp  = require('chai-http'),
	    mongoose  = require('mongoose'),
	    jwt       = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { TEST_DB_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');

const User = require('../models/users'),
	    Challenge = require('../models/challenges'),
	    Submission = require('../models/submissions');

const seedUsers = require('../test-seed/users');
const seedChallenges = require('../test-seed/challenges');
const seedSubmissions = require('../test-seed/submissions');

const expect = chai.expect;
const should = chai.should();
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
		return runServer(TEST_DB_URL);
	});

	beforeEach(function() {
		return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),

			Submission.insertMany(seedSubmissions),
			Submission.createIndexes()
    ])
    .then(([users]) => {
			user = users[0];
			token = jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
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
      const apiPromise = chai
        .request(app)
        .get('/api/submissions');

			return Promise.all([dbPromise, apiPromise]).then(([submission, res]) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(submission.length);
			});
		});

		it.only('Should return submissions with correct fields', function() {
			let resSubmission;
			return chai
				.request(app)
				.get('/submissions')
				.then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
					expect(res.body).to.be.an('array');
					

					res.body.forEach(function(submission) {
						submission.should.be.a('object');
						submission.should.include.keys(
							'id',
							'challenge',
							'creator',
              'cloudinary_id',
              'image'
						);
					});
					resSubmission = res.body[0];
					return Submission.findById(resSubmission.id);
				})
				.then(submission => {
					resSubmission.id.should.equal(submission.id);
					resSubmission.challenge.should.equal(submission.challenge.toString());
					resSubmission.creator.should.equal(submission.creator.toString());
				});
		});
	});

	describe('Submissions POST endpoint', function() {
		it('Should add new submission', function() {
			const newSubmission = {
				dateCreated: faker.date.recent(),
				creator: faker.internet.userName(),
				challenge: faker.lorem.words()
			};
			return chai
				.request(app)
				.post('/submissions')
				.send(newSubmission)
				.then(function(res) {
					res.should.have.status(201);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.include.keys('id', 'challenge', 'creator');
					res.body.challenge.should.equal(newSubmission.challenge);
					res.body.creator.should.equal(newSubmission.creator);
					res.body.id.should.not.be.null;
					return Submission.findById(res.body.id);
				})
				.then(function(submission) {
					submission.challenge.should.equal(newSubmission.challenge);
					submission.creator.should.equal(newSubmission.creator);
				});
		});
	});

	describe('Submissions PUT endpoint', function() {
		it('Should update fields sent over', function() {
			const updateData = {
				challenge: faker.lorem.words()
			};

			return Submission.findOne()
				.then(submission => {
					updateData.id = submission.id;

					return chai
						.request(app)
						.put(`/submissions/${submission.id}`)
						.send(updateData);
				})
				.then(res => {
					res.should.have.status(200);
					res.body.should.include.keys('id', 'challenge');
					res.body.challenge.should.equal(updateData.challenge);
					return Submission.findById(updateData.id);
				})
				.then(submission => {
					submission.challenge.should.equal(updateData.challenge);
				});
		});
	});

	describe('Submissions DELETE endpoint', function() {
		it('Should update fields sent over', function() {
			let submission;

			return Submission.findOne()
				.then(_submission => {
					submission = _submission;
					return chai.request(app).delete(`/submissions/${submission.id}`);
				})
				.then(res => {
					res.should.have.status(204);
					return Submission.findById(submission.id);
				})
				.then(_submission => {
					should.not.exist(_submission);
				});
		});
	});
});
