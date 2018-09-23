'use strict';

// const app = (function() {

  const storeChallenges = {
    challenges: [],
    currentChallenge: null
  }

  function getChallenges(){
    console.log('getChallenges() invoked')
    // const token = 
    const settings = {
      async: true,
      crossDomain: true,
      url: '/challenges',
      method: 'GET',
      // headers { // implement with auth

      // },
    }
    $.ajax(settings).done((res) => {
      storeChallenges.challenges = res.challenge
      displayChallenges()
    })
  }

  //display title and desc:
  function displayChallenges(data){ 
    const challenges = storeChallenges.challenges.map(challenge => `
        '<div class="one-third"><img class="thumbnail" src="${challenge.thumbnail}"><h2>'${challenge.title}'</h2>
        `)
    $('#challenges').append(challenges)
  }

  //run fns above
  function getAndDisplayChallenges(){
    getChallenges(displayChallenges)
  }

  function bindEventListeners(){
    console.log('hello from bindEventListeners()')
    // handleSignupSubmit()
    // handleLoginSubmit()

    // handleSubmissionSubmit()
  }

  function handleLoginSubmit(){

  }

  function render(){
    console.log('hello from render()')
    getChallenges()
  }

  //SUBMISSIONS ON DASHBOARD
  function getUserSubmissions(callback){
    console.log('hello from getUserSubmissions()')
  };

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

  // Exposed methods in other files
//   return {
//     render: render,
//     bindEventListeners: bindEventListeners
//   }
// })