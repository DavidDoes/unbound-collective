'use strict';

// const app = (function() {


// Challenges
  const storeChallenges = {
    challenges: []
  }

  function getChallenges(){
    console.log('getChallenges() invoked')
    // const token = 
    const settings = {
      async: true,
      crossDomain: true,
      url: '/challenges',
      method: 'GET'
      // headers: { // implement with auth

      // },
    }
    $.ajax(settings).done((res) => {
      storeChallenges.challenges = res.challenge
      displayChallenges()
    })
  }

  function displayChallenges(data){ 
    const challenges = storeChallenges.challenges.map(challenge => `
        <div class="one-third card"><img class="thumbnail" src="${challenge.thumbnail}"><h2>${challenge.title}</h2>
        </div>
        `)
    $('#challenges').append(challenges)
  }

  function getAndDisplayChallenges(){
    getChallenges(displayChallenges)
  }

  // Submissions
  const storeSubmissions = {
    submissions: []
  }

  function getSubmissions(){
    console.log('getSubmissions() invoked')
    const settings = {
      async: true,
      crossDomain: true,
      url: '/submissions',
      method: 'GET'
      // headers: {}
    }
    $.ajax(settings).done((res) => {
      storeSubmissions.submissions = res.submissions
      displaySubmissions()
    })
  }

  function displaySubmissions(){
    const submission = storeSubmissions.submissions.map(submission => `
    <div class="one-fourth"><img class="thumbnail" src="${submission.photo}">
    <p>Submitted by ${submission.creator}.</p>
    </div>
    `)
    $('')
  }

  function getAndDisplaySubmissions(){
    getSubmissions(displaySubmissions)
  }

//
  function bindEventListeners(){
    console.log('hello from bindEventListeners()')
    // user clicks on challenge
    $(document).on('click', '.card', (event) => {
      getAndDisplaySubmissions()
    })
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

  $(function(){
    bindEventListeners()
    getAndDisplayChallenges()
    getAndDisplaySubmissions()
  })

  // Exposed methods in other files
//   return {
//     render: render,
//     bindEventListeners: bindEventListeners
//   }
// })