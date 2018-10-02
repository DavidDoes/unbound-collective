'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { app, runServer, closeServer } = require('../server')

const  { TEST_DB_URL, PORT }    = require('../config')
const  Submission     = require('../models/submissions')
const  User           = require('../models/users')
const  Challenge      = require('../models/challenges')

const random = Math.floor(Math.random())

const seedUsers = {
  username: faker.internet.username,
  password: faker.internet.password
}

const seedSubmissions = {
  challenge: Challenge.id,
  creator: User.id,
  photo: faker.image.imageUrl
}

const seedChallenges = {
  title: faker.lorem.words,
  creator: User.id
}

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

describe('Challenges resource', function(){
  let user
  let token

  before(function () {
    return runServer(TEST_DB_URL)
  })

  beforeEach(function(){
    return Promise.all([
      User.insertMany(seedUsers),
      Challenge.insertMany(seedChallenges),
      Submission.insertMany(seedSubmissions)
    ])
    .then(([users]) => {
      user = users[0]
      token = jwt.sign({user}, JWT_SECRET, {subject: user.username})
    })
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
        .get('/api/challenges')
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
        .get('/api/challenges')
        .then(function(res){
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.should.have.lengthOf.at.least(1)

          res.body.forEach(function(challenge){
            challenge.should.be.a('object')
            challenge.should.include.keys('id', 'title', 'creator', 'description', 'thumbnail')
          })
          resChallenge = res.body[0]
          return Challenge.findById(resChallenge.id)
        })
        .then(challenge => {
          resChallenge.id.should.equal(challenge.id)
          resChallenge.title.should.equal(challenge.title)
          resChallenge.creator.should.equal(challenge.creator)
          resChallenge.description.should.equal(challenge.description)
          resChallenge.thumbnail.should.equal(challenge.thumbnail)
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
        .post('/api/challenges')
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
        description: 'string'
      }

      return Challenge
        .findOne()
        .then(challenge => {
          updateData.id = challenge.id

          return chai.request(app)
            .put(`api/challenges/${challenge.id}`)
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
          return chai.request(app).delete(`api/challenges/${challenge.id}`)
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