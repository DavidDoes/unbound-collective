'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const app = require('../server')

chai.use(chaiHttp)

describe('Root', function(){
  it('should respond with status 200', function(){
    return chai
    .request(app)
    .get('/')
    .then(function(res){ 
      expect(res).to.have.status(200)
    }) 
  })
})

describe('Dashboard', function(){
  it('should respond with status 200', function(){
    return chai
    .request(app)
    .get('/dashboard.html') //must specify html
    .then(function(res){
      expect(res).to.have.status(200)
      expect(res).to.be.html
    })
  })
})