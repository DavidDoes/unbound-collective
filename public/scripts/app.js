'use strict';

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

  // user clicks on challenge
  $(document).on('click', '.card', (event) => {
    getAndDisplaySubmissions()
  })

//
  function bindEventListeners(){
    console.log('hello from bindEventListeners()')

    handleSignupSubmit()
    handleLoginSubmit()

    // handleSubmissionSubmit()
  }

  function handleSignupSubmit(){
    $('.js-signup-from').on('submit', event => {
      event.preventDefault()
  
      const signupForm = $(event.currentTarget)
      const newUser = {
        username: signupForm.find('.js-username-entry').val(),
        password: signupForm.find('.js-password-entry').val()
      } // in api.js
      api.create('/api/users', newUser)
        .then(res => {
          signupForm[0].reset() //clear storage
          showSuccessMsg(`Signup successful. Please login.`)
        })
        .catch(handleErrors)
    })
  }

  function handleLoginSubmit(){
    $('.js-login-form').on('submit', event => {
      event.preventDefault();

      const loginForm = $(event.currentTarget)
      const loginUser = {
        username: loginForm.find('.js-username-entry').val(),
        password: loginForm.find('.js-password-entyr').val()
      }
      api.create('/api/login', loginUser)
        .then(res => {
          store.authToken = response.authToken
          store.authorized = true
          loginForm[0].reset()

          return Promise.all([
            api.search('/api/submissions')
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
    getAndDisplaySubmissions()
  })

  function render(){
    $('.signup-login').toggle(!store.authorized) //unauthorized, not allowed
    // show user's submissions on dashboard
    const submissionsList = showUserSubmissions(store.submissions)
    $('.js-submissions-list').html(submissionsList)
  }
// show on dashboard
  function showUserSubmissions(submissions){
    const userSubmissions = submissions.map(submission => `
    <div class="one-fourth"><img class="thumbnail" src="${submission.photo}">
    <p><a href="">Remove Submission</a></p>
    </div>
  `)
    $('.js-user-submissions').html(userSubmissions)
  }

  // Exposed methods in other files
//   return {
//     render: render,
//     bindEventListeners: bindEventListeners
//   }
// })