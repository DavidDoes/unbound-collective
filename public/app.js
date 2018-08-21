var MOCK_CHALLENGES = {
  "challenges": [
    {
      "id": "11111111",
      "title": "Patterns",
      "description": "Find patterns. Try to think outside the box to redefine your idea of what a pattern is.",
      "entries": 42,
      "creator": "Name 1",
      "thumbnail": "\/images\/patterns-thumb.jpg"
    },
    {
      "id": "22222222",
      "title": "Reflections",
      "description": "A 'reflection' could be that of a mirror, a body of water, a self-portrait, a representation of an idea, etc.",
      "entries": 76,
      "creator": "Name 2",
      "thumbnail": "\/images\/reflections-thumbnail.jpg"
    },
    {
      "id": "3333333",
      "title": "Get Closer",
      "description": "Instead of shooting from a distance, pop on that 50mm or lower lens and get closer to your subject.",
      "entries": 50,
      "creator": "Name 3",
      "thumbnail": "\/images\/get-closer-thumbnail.jpg"
    }
  ]
}

var MOCK_USERS = {
  "users": [
    {
      "username": "CoolPerson",
      "password": "socool"
    },
    {
      "username": "ProUser",
      "password": "winner"
    }
  ]
}

var MOCK_PHOTOS = {
  "submissions": [
    {
      "creator": "CoolPerson",
      "dateCreated": new Date(2018, 6, 24),
      "challenge": "Patterns"
    },
    {
      "creator": "ProUser",
      "dateCreated": new Date(2018, 7, 2),
      "challenge": "Patterns"
    },
    {
      "creator": "ProUser",
      "dateCreated": new Date(2018, 6, 29),
      "challenge": "Get Closer"
    },
    {
      "creator": "ProUser",
      "dateCreated": new Date(2018, 6, 20),
      "challenge": "Reflections"
    }
  ]
}

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

$(function(){
  getAndDisplayChallenges()
  getAndDisplayUserSubmissions()
})