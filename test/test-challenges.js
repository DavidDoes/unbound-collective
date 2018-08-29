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

const { TEST_DB_URL }   = require('../config'),
      { Challenge }     = require('../challenges/models'),
      { Submission }    = require('../submissions/models'), 
      { User }          = require('../users/models')

const should = chai.should()
chai.use(chaiHttp)

function tearDownDb(){
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}

function seedChallengesData(){
  console.info('seeding challenges')

  const challengeCreator = {
    username: 'ChallengeCreator',
    password: 'securepass'
  }

  return User
    .create(challengeCreator)
    .then(function (user) {
      return Submission
        .create({
          dateCreated: new Date(),
          challenge: 'Sample Challenge Title',
          creator: user._id
      })
      .then(function (submission) {
        const seedChallenges = []
        for (let i = 0; i <= 1; i++) {
          seedChallenges.push({
            title: 'Submission title',
            description: 'Challenge description',
            submission: submission._id,
            creator: user._id
          })
        }
        return Challenge.insertMany(seedChallenges)
      })
  })
}

describe('Challenges resource', function(){

  before(function () {
    return runServer(TEST_DB_URL)
  })

  beforeEach(function(){
    return seedChallengesData()
  })

  afterEach(function(){
    return tearDownDb()
  })

  after(function () {
    return closeServer()
  })

  describe('Challenges GET endpoint', function(){
    it('Should return all existing challenges', function(){
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

    it('Should return challenges with correct fields', function(){
      let resChallenge
      return chai.request(app)
        .get('/challenges')
        .then(function(res){
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.should.have.lengthOf.at.least(1)

          res.body.forEach(function(challenge){
            challenge.should.be.a('object')
            challenge.should.include.keys('id', 'title', 'creator', 'description')
          })
          resChallenge = res.body[0]
          return Challenge.findById(resChallenge.id)
        })
        .then(challenge => {
          resChallenge.id.should.equal(challenge.id)
          resChallenge.title.should.equal(challenge.title)
          resChallenge.creator.should.equal(challenge.creator)
          resChallenge.description.should.equal(challenge.description)
        })
    })
  })

  describe('Challenges POST endpoint', function(){
    it('Should add new challenge', function(){
      const newChallenge = {
        title: faker.lorem.words(),
        creator: faker.internet.userName(),
        description: faker.lorem.paragraph()
      }
      // console.log('>>>>>>>>>>>>>>>>>>>' + newChallenge.description)
      return chai.request(app)
        .post('/challenges')
        .send(newChallenge)
        .then(function(res){
          res.should.have.status(201)
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'title', 'creator')
          res.body.title.should.equal(newChallenge.title)
          res.body.creator.should.equal(newChallenge.creator)
          res.body.id.should.not.be.null
          return Challenge.findById(res.body.id)
        })
        .then(function(challenge){
          challenge.title.should.equal(newChallenge.title)
          challenge.creator.should.equal(newChallenge.creator)
        })
    })
  })

  describe('Challenges PUT endpoint', function(){
    it('Should update fields sent over', function(){
      const updateData = {
        title: 'string',
        creator: 'string',
        description: 'string',
        numSubmissions: Number
      }

      return Challenge
        .findOne()
        .then(challenge => {
          updateData.id = challenge.id

          return chai.request(app)
            .put(`/challenges/${challenge.id}`)
            .send(updateData)
        })
        .then(res => {
          res.should.have.status(200)
          return Challenge.findById(updateData.id)
        })
        .then(challenge => {
          challenge.title.should.equal(updateData.title)
          // challenge.creator.should.equal(updateData.creator)
          challenge.description.should.equal(updateData.description)
          // challenge.numSubmissions.should.equal(updateData.numSubmissions)
        })
    })
  })

  describe('Challenges DELETE endpoint', function(){
    it('Should update fields sent over', function(){
      let challenge

      return Challenge
        .findOne()
        .then(_challenge => {
          challenge = _challenge
          return chai.request(app).delete(`/challenges/${challenge.id}`)
        })
        .then(res => {
          res.should.have.status(204)
          return Challenge.findById(challenge.id)
        })
        .then(_challenge => {
          should.not.exist(_challenge)
        })
    })
  })
})