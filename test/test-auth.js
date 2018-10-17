'use strict';

const chai = require('chai'),
	    chaiHttp = require('chai-http'),
	    mongoose = require('mongoose'),
      jwt = require('jsonwebtoken');
  
const { app, runServer, closeServer } = require('../server');
const { TEST_DB_URL, TEST_PORT, JWT_SECRET } = require('../config');

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

describe('Login resources', function() {
  let user;

  const username = 'testUser';
  const password = 'testPass';

	before(function() {
		return runServer(TEST_DB_URL, TEST_PORT);
	});

	beforeEach(function() {
    return User.hashPassword(password)
      .then(config => User.create({
        username,
        password: config
      }))
      .then(_user => {
        user = _user;
      })
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
  });

  describe('/api/login', function(){
    it("Should return 400 Error 'No credentials provided' when none sent", function(){
      return chai
        .request(app)
        .post('/api/login')
        .send({  })
        .then(res => {
          console.log('>>> res.body: ' + res.body)
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('No credentials provided. Please try again.');
        });
    });

    it("Should return 'Invalid username' when sent invalid username", function() {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username: 'invalidUser', password })
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body.message).to.equal('Invalid username. Please try again.');
          expect(res.body.location).to.equal('username');
        })
    })

    it("Should return 'Invalid password' when sent invalid password", function() {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username, password: 'invalidPass' })
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body.message).to.equal('Invalid password. Please try again.');
          expect(res.body.location).to.equal('password');
        })
    })

    it("Should return status 200 with valid JWT in 'authToken'", function() {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.authToken).to.be.a('string');
          jwt.verify(res.body.authToken, JWT_SECRET);
        })
    })

  });
});