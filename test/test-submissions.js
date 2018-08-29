'use strict'

const chai      = require('chai'),
      chaiHttp  = require('chai-http'),
      faker     = require('faker'),
      mongoose  = require('mongoose')

const {
  app,
  runServer,
  closeServer
} = require('../server')

const { TEST_DB_URL }   = require('../config'), 
      { Submission }    = require('../submissions/models'), 
      { User }          = require('../users/models'),
      { Challenge }     = require('../challenges/models')

const should = chai.should()
chai.use(chaiHttp)

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}

function seedSubmissionsData() {
  console.info('seeding submissions')

  const superUser = {
    username: 'SuperUser',
    password: 'securepass'
  }

  return User
    .create(superUser)
    .then(function (user) {
      return Challenge
          .create({
          title: 'The best title!',
          numSubmissions: 13,
          description: 'This is a great description!',
          creator: user._id
        })
        .then(function (challenge) {
          const seedSubmissions = []
          for (let i = 0; i <= 1; i++) {
            seedSubmissions.push({
              challenge: challenge._id,
              creator: user._id
            })
          }
          return Submission.insertMany(seedSubmissions)
        })
    })
  }

  describe('Submissions resource', function () {

    before(function () {
      return runServer(TEST_DB_URL)
    })

    beforeEach(function () {
      return seedSubmissionsData()
    })

    afterEach(function () {
      return tearDownDb()
    })

    after(function () {
      return closeServer()
    })

    describe('Submissions GET endpoint', function () {
      it('Should return all existing submissions', function () {
        let res
        return chai.request(app)
          .get('/submissions')
          .then(_res => {
            res = _res
            res.should.have.status(200)
            res.body.should.have.lengthOf.at.least(1)
            return Submission.count()
          })
          .then(count => {
            res.body.should.have.lengthOf(count)
          })
      })

      it('Should return submissions with correct fields', function () {
        let resSubmission
        return chai.request(app)
          .get('/submissions')
          .then(function (res) {
            res.should.have.status(200)
            res.should.be.json
            res.body.should.be.a('array')
            res.body.should.have.lengthOf.at.least(1)

            res.body.forEach(function (submission) {
              submission.should.be.a('object')
              submission.should.include.keys('id', 'challenge', 'creator')
            })
            resSubmission = res.body[0]
            return Submission.findById(resSubmission.id) 
          })
          .then(submission => {
            resSubmission.id.should.equal(submission.id)
            resSubmission.challenge.should.equal(submission.challenge.toString())
            resSubmission.creator.should.equal(submission.creator.toString())
          })
      })
    })

    describe('Submissions POST endpoint', function () {
      it('Should add new submission', function () {
        const newSubmission = {
          dateCreated: faker.date.recent(),
          creator: faker.internet.userName(),
          challenge: faker.lorem.words()
        }
        return chai.request(app)
          .post('/submissions')
          .send(newSubmission)
          .then(function (res) {
            res.should.have.status(201)
            res.should.be.json
            res.body.should.be.a('object')
            res.body.should.include.keys('id', 'challenge', 'creator')
            res.body.challenge.should.equal(newSubmission.challenge)
            res.body.creator.should.equal(newSubmission.creator)
            res.body.id.should.not.be.null
            return Submission.findById(res.body.id)
          })
          .then(function (submission) {
            submission.challenge.should.equal(newSubmission.challenge)
            submission.creator.should.equal(newSubmission.creator)
          })
      })
    })

    describe('Submissions PUT endpoint', function () {
      it('Should update fields sent over', function () {
        const updateData = {
          challenge: faker.lorem.words()
        }

        return Submission
          .findOne()
          .then(submission => {
            updateData.id = submission.id

            return chai.request(app)
              .put(`/submissions/${submission.id}`)
              .send(updateData)
          })
          .then(res => {
            res.should.have.status(200)
            res.body.should.include.keys('id', 'challenge')
            res.body.challenge.should.equal(updateData.challenge)
            return Submission.findById(updateData.id)
          })
          .then(submission => {
            submission.challenge.should.equal(updateData.challenge)
          })
      })
    })

    describe('Submissions DELETE endpoint', function () {
      it('Should update fields sent over', function () {
        let submission

        return Submission
          .findOne()
          .then(_submission => {
            submission = _submission
            return chai.request(app).delete(`/submissions/${submission.id}`)
          })
          .then(res => {
            res.should.have.status(204)
            return Submission.findById(submission.id)
          })
          .then(_submission => {
            should.not.exist(_submission)
          })
      })
    })
  })
