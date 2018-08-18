var MOCK_CHALLENGES = {
  "challenges": [
    {
      "id": "11111111",
      "title": "Patterns",
      "description": "Find patterns. Try to think outside the box to redefine your idea of what a pattern is.",
      "entries": 42,
      "creator": "Name 1"
    },
    {
      "id": "22222222",
      "title": "Reflections",
      "description": "A 'reflection' could be that of a mirror, a body of water, a self-portrait, what-have-you.",
      "entries": 76,
      "creator": "Name 2"
    },
    {
      "id": "3333333",
      "title": "Get Closer",
      "description": "Instead of shooting from a distance, pop on that 50mm or lower lens and get closer to your subject.",
      "entries": 50,
      "creator": "Name 3"
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
      "photo": "../images/_DSC5452.png"
    },
    {
      "creator": "ProUser",
      "dateCreated": new Date(2018, 7, 13),
      "photo": "../images/_DSC3290.png"
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
  console.log(data)

  for (index in data.challenges){ 
    $('#challenges').append(
      '<div class="one-third"><h2>' + data.challenges[index].title + '</h2><p>' + data.challenges[index].description + '</p><p>' + data.challenges[index].entries + ' entries</p><p>Created by ' + data.challenges[index].creator + '</p></div>'
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
  console.log(data)
  let currentUser = "ProUser" // username of current logged-in user

  for (var i = 0; i < data.submissions.length; i++){
  // for (index in data.submissions){
    if (data.submissions[i].creator === currentUser){
      $('#userSubmissions').append(
        '<div class="one-third><img src="' + data.submissions[i].photo + '"</img></div>'
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