'use strict';

const chai = require('chai'),
	chaiHttp = require('chai-http'),
	mongoose = require('mongoose'),
	jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { TEST_DB_URL, TEST_PORT, JWT_SECRET, JWT_EXPIRY } = require('../config');

const User = require('../models/users');

const seedUsers = require('../test-seed/users');

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

describe('Users resources', function() {
	const username = 'testUser';
	const password = 'testPass10';

	let user = {};
	let token;

	before(function() {
		return runServer(TEST_DB_URL, TEST_PORT);
	});

	beforeEach(function() {
		return Promise.all([
			User.insertMany(seedUsers),
			User.createIndexes(seedUsers)
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

	describe('POST /api/users', function() {
		it('Should create new user', function() {
			let res;

			return chai
				.request(app)
				.post('/api/users')
				.send({ username, password })
				.then(_res => {
					res = _res;
					expect(res).to.have.status(201);
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.all.keys('id', 'username');
					expect(res.body.id).to.exist;
					expect(res.body.username).to.equal(username);
					return User.findOne({ username });
				})
				.then(user => {
					expect(user).to.exist;
					expect(user.id).to.equal(res.body.id);
					return user.validatePassword(password);
				})
				.then(isValid => {
					expect(isValid).to.be.true;
				});
		});
	});

	describe('DELETE /api/users/:id', function() {
		it('Should delete user by id', function() {
			let data;

			return User.findOne()
				.then(_data => {
					data = _data;
					return chai
						.request(app)
						.delete(`/api/users/${data.id}`)
						.send({ username, password })
						.set('Authorization', `Bearer ${token}`);
				})
				.then(res => {
					expect(res).to.have.status(204);
					expect(res.body).to.be.empty;
					return User.findById(data.id);
				})
				.then(user => {
					expect(user).to.be.null;
				});
		});
	});
});
