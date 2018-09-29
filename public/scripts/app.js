'use strict';

const app = (function() {

function showSuccessMsg(msg){
  const listener = $('.js-success-msg')
  listener.text(msg).show()
  setTimeout(() => listener.fadeOut('slow'), 2000)
}

function showFailMsg(msg){
  const listener = $('.js-fail-msg')
  listener.text(msg).show()
  setTimeout(() => listener.fadeOut('slow'), 2000)
}

// Challenges
  const storeChallenges = {
    challenges: []
  }

  function getChallenges(){
    // const token = 
    const settings = {
      async: true,
      crossDomain: true,
      url: '/api/challenges',
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

  // user clicks on challenge
  $(document).on('click', '.card', (event) => {
    console.log('challenge card clicked')
    // getAndDisplaySubmissions()
  })

//
  function bindEventListeners(){

    signupSubmit()
    loginSubmit()

    // handleSubmissionSubmit()
  }

  function signupSubmit(){
    $('.js-signup-form').on('submit', event => {
      event.preventDefault()
  
      const signupForm = $(event.currentTarget)
      const newUser = {
        username: signupForm.find('.js-username-entry').val(),
        password: signupForm.find('.js-password-entry').val()
      } // in api.js
      api.create('/api/users', newUser)
        .then(res => {
          signupForm[0].reset() //clear storage
          showSuccessMsg(`Thank you, ${res.username}! Signup successful. Please login.`)
          console.log('user created')
        })
        .catch(handleErrors)
    })
  }

  function loginSubmit(){
    $('.js-login-form').on('submit', event => {
      event.preventDefault()
      console.log('hello from loginSubmit()')

      const loginForm = $(event.currentTarget)
      const loginUser = {
        username: loginForm.find('.js-username-entry').val(),
        password: loginForm.find('.js-password-entry').val()
      }
      api.create('/api/login', loginUser)
        .then(res => {
          store.authToken = res.authToken
          store.authorized = true
          loginForm[0].reset()

          return Promise.all([
            api.search('/api/users/:id/submissions')
          ])
        })
        .then(([submissions]) => {
          store.submissions = submissions
          render()
        })
    })
  }

  $(function(){
    bindEventListeners()
    getAndDisplayChallenges()
  })

  function render(){
    $('.signup-login').toggle(!store.authorized) //unauthorized, not allowed
    // show all submissions of challenge
    // incomplete
    // const submissionsList = showAllSubmissions(store.submissions)
    // $('.js-submissions-list').html(submissionsList)
    // // show user's challenges on dashboard
    // const mySubmissions = showMySubmissions(store.mySubmissions)
    // $('.js-my-submissions').html(mySubmissions)
  }
  // show all challenges
  function showAllSubmissions(submissions){
    const allSubmissions = submissions.map(submission => `
    <div class="one-fourth"><img class="thumbnail" src="${submission.photo}">
    </div>
  `)
    $('.js-all-submissions').html(allSubmissions)
    // include this in challenge display
  }
}())