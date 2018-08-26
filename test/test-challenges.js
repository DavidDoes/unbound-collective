'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

const {
  app,
  runServer,
  closeServer
} = require('../server')
const {
  TEST_DB_URL
} = require('../config')
const {
  Challenge
} = require('../challenges/models')

const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}

function seedChallengesData() {
  console.info('seeding Challenges')
  const seedData = []
  for (let i = 1; i <= 5; i++) {
    seedData.push({
      // id: faker.random.number(),
      title: faker.lorem.words(),
      creator: faker.internet.userName(),
      numSubmissions: faker.random.number(),
      dateCreated: faker.date.recent()
    })
    // console.log(seedData)
  }
  return Challenge.insertMany(seedData)
}

describe('Challenges resource', function () {

  before(function () {
    return runServer(TEST_DB_URL)
  })

  beforeEach(function () {
    return seedChallengesData()
  })

  afterEach(function () {
    return tearDownDb()
  })

  after(function () {
    return closeServer()
  })

  describe('Challenges GET endpoint', function () {
    it('Should return all existing Challenges', function () {
      let res
      return chai.request(app)
        .get('/challenges')
        .then(_res => {
          res = _res
          res.should.have.status(200)
          res.body.should.have.lengthOf.at.least(1)
          return Challenge.count()
        })
        .then(count => {
          res.body.should.have.lengthOf(count)
        })
    })
    it('Should return Challenges with correct fields', function () {
      let resChallenge
      return chai.request(app)
        .get('/challenges')
        .then(function (res) {
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.should.have.lengthOf.at.least(1)

          res.body.forEach(function (challenge) {
            challenge.should.be.a('object')
            challenge.should.include.keys('title', 'creator', 'numSubmissions')
          })
          resChallenge = res.body[0]
          return Challenge.findById(resChallenge)
        })
        .then(challenge => {
          // resChallenge.id.should.equal(challenge.id)
          resChallenge.title.should.equal(challenge.title)
          resChallenge.creator.should.equal(challenge.creator)
          resChallenge.numSubmissions.should.equal(challenge.numSubmissions)
          // resChallenge.dateCreated.should.equal(challenge.dateCreated)
        })
    })
  })
})