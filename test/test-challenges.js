'use strict';

const chai = require('chai'),
	chaiHttp = require('chai-http'),
	mongoose = require('mongoose'),
	jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { TEST_DB_URL, JWT_SECRET, TEST_PORT } = require('../config');

const User = require('../models/users'),
	Challenge = require('../models/challenges');

const seedUsers = require('../test-seed/users');
const seedChallenges = require('../test-seed/challenges');

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

describe('Challenges resource', function() {
	let user = {};
	let token;

	before(function() {
		return runServer(TEST_DB_URL, TEST_PORT);
	});

	beforeEach(function() {
		console.info('seeding Users and Challenges');
		return Promise.all([
			User.insertMany(seedUsers),
			User.createIndexes(seedUsers),
			Challenge.insertMany(seedChallenges),
			Challenge.createIndexes()
		]).then(([users]) => {
			user = users[0];
			token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
		});
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('GET /api/challenges', function() {
		it('Should return all existing challenges', function() {
			const dbPromise = Challenge.find();
			const apiPromise = chai.request(app).get('/api/challenges');

			return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an('array');
				expect(res.body.length).to.equal(data.length);
			});
		});

		it('Should return challenges with correct fields', function() {
			const dbPromise = Challenge.find();
			const apiPromise = chai.request(app).get('/api/challenges');

			return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an('array');
				expect(res.body.length).to.equal(data.length);

				res.body.forEach(function(challenge, i) {
					expect(challenge).to.have.all.keys('id', 'title', 'creator');
					expect(challenge.id).to.equal(data[i].id);
					expect(challenge.title).to.equal(data[i].title);
				});
			});
		});
	});

	describe('GET /api/challenges/:id', function() {
		it('Should return challenge of provided id', function() {
			let challenge;
			return Challenge.findOne()
				.then(_challenge => {
					challenge = _challenge;
					return chai.request(app).get(`/api/challenges/${challenge.id}`);
				})
				.then(res => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.all.keys('id', 'title', 'creator');
					expect(res.body.id).to.equal(challenge.id);
					expect(res.body.title).to.equal(challenge.title);
					expect(res.body.creator).to.equal(challenge.creator.toString());
				});
		});
	});

	describe('POST /api/challenges', function() {
		it('Should add a new challenge', function() {
			const newChallenge = {
				title: 'New Challenge'
      };
      let body;
			return chai
				.request(app)
				.post('/api/challenges')
				.set('Authorization', `Bearer ${token}`)
				.send(newChallenge)
				.then(function(res) {
          body = res.body;
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(body).to.be.an('object');
					expect(body).to.have.all.keys('id', 'title', 'creator');
					return Challenge.findOne({ _id: body.id, creator: user.id });
				})
				.then(challenge => {
					expect(body.id).to.equal(challenge.id);
					expect(body.title).to.equal(challenge.title);
				});
		});
	});

	describe('DELETE /api/challenges/:id', function() {
		it('Should delete challenge of provided id', function() {
			let challenge;

			return Challenge.findOne({ creator: user.id })
				.then(_challenge => {
					challenge = _challenge;
					return chai
						.request(app)
						.delete(`/api/challenges/${challenge.id}`)
						.set('Authorization', `Bearer ${token}`);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					expect(res.body).to.be.empty;
					return Challenge.findById(challenge.id);
				})
				.then(challenge => {
					expect(challenge).to.be.null;
				});
		});
	});
});