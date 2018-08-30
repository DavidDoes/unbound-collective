'use strict';

const express = require('express');
const app     = express();

//CHALLENGES ON INDEX.html
//replace when seeding real data
function getChallenges(callback){
  setTimeout(function(){
    callback(MOCK_CHALLENGES)
  }, 100
  )
}
//display title and desc:
function displayChallenges(data){ 
  // console.log(data)

  for (index in data.challenges){ 
    $('#challenges').append(
      '<div class="one-third"><img class="thumbnail" src="' + data.challenges[index].thumbnail + '"><h2>' + data.challenges[index].title + '</h2><p>' + data.challenges[index].description + '</p><p>' + data.challenges[index].entries + ' entries</p><p>Created by ' + data.challenges[index].creator + '</p></div>'
    )
  }
}
//run fns above
function getAndDisplayChallenges(){
  getChallenges(displayChallenges)
}

//SUBMISSIONS ON DASHBOARD
function getUserSubmissions(callback){
  setTimeout(function(){
    callback(MOCK_PHOTOS)
  }, 100
  )
}

function displayUserSubmissions(data){
  // console.log(data)
  let currentUser = "ProUser" // username of current logged-in user

  for (index in data.submissions){ 
    if (data.submissions[index].creator === currentUser){
      $('#userSubmissions').append(
        '<div class="one-third"><p>Submitted to Challenge <b>' + data.submissions[index].challenge + '</b></p><p>' + 'Submitted ' + data.submissions[index].dateCreated + '</p></div>'
      )
    }
  }
}

function getAndDisplayUserSubmissions(){
  getUserSubmissions(displayUserSubmissions)
}

function newUserSubmission(){
  
}

$(function(){
  getAndDisplayChallenges()
  getAndDisplayUserSubmissions()
})

module.exports = app