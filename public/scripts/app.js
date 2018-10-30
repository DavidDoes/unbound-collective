'use strict';
// const app = (function () {

$(document).ready(function() {
	// render();

	function showSuccessMsg(msg) {
		const listener = $('.js-success-msg');
		listener.text(msg).show();
		setTimeout(() => listener.fadeOut('slow'), 2000);
	}

	function showFailMsg(msg) {
		const listener = $('.js-err-msg');
		listener.text(msg).show();
		setTimeout(() => listener.fadeOut('slow'), 2000);
	}

	function handleErrors(err) {
		if (err.status === 401) {
			store.authorized = false;
			render();
		}
		showFailMsg(err.responseJSON.msg);
	}

	function render() {
		const challenges = displayChallenges(store.challenges);
		$('.js-challenges').html(challenges);
	}

	$(function() {
    renderNav();
		challengeClickListener();
		getChallenges();
		discoverClickListener();
		submissionFormSubmit();
		challengeFormSubmit();
		signupSubmit();
		loginSubmit();
		logoutListener();
		yourSubmissionsListener();
    newChallengeListener();
    backButtonListener();
    newSubmissionListener();
  });

  function isLoggedIn() {
		return store.authToken ? true : false;
  }
  
  function renderNav() {
    if (isLoggedIn()){
      $('.hero-image').addClass('hidden');
      $('.main-nav').addClass('hidden');
      $('.aux-nav').removeClass('hidden');
    } else {
      $('.hero-image').removeClass('hidden');
      $('.aux-nav').addClass('hidden');
      $('.main-nav').removeClass('hidden');
    }
  }

	function getChallenges() {
		return api.search('/api/challenges').then(res => {
			store.challenges = res;

			render();
		});
	}

	function displayChallenges(challenges) {
		const challengeItems = challenges.map(
			challenge =>
				`
        <div class="one-third" id="${
					challenge.id
				}"><div class="content-overlay"></div>
        <img class="thumbnail" src="${challenge.image}">
        <div class="content-details fadeIn-top">
        <h3>${challenge.title}</h3>
        </div>
        </div>
        `
		);
    $('#challenges').append(challengeItems);

    if (isLoggedIn()){
      $('#new-challenge').removeClass('hidden');
    } else {
      $('#new-challenge').addClass('hidden');
    }
	}

	function discoverClickListener() {
		$('.hero-text').on('click', '#discover', function() {
			$([document.documentElement, document.body]).animate(
				{
					scrollTop: $('#about').offset().top
				},
				1500
			);
		});
	}

	function challengeClickListener() {
		$('.container').on('click', '.one-third', event => {
			const challengeId = $(event.currentTarget).prop('id');
      console.log(challengeId);

			getSubmissions(challengeId);
		});
	}

	function newChallengeListener() {
		$('#new-challenge').on('click', '#new-challenge-button', event => {
			event.preventDefault();
			console.log('challenge button clicked');
			$('#modal-challenge-form').removeClass('hidden');
			$('#modal-challenge-form').addClass('is-selected');
			$('#challenge-overlay').addClass('is-visible is-selected');
		});
	}

	function challengeFormSubmit() {
		$('#js-new-challenge').on('submit', event => {
			event.preventDefault();

			const newChallengeTitle = $('.js-title-input').val();
      const newChallengeImage = $('.js-challenge-upload').val();
      console.log('title', newChallengeTitle);

			const file = document.getElementById('image').files[0];
			const formData = new FormData();
            formData.append('image', file);
      // formData.append('title', newChallengeTitle);

			// console.log('formData: ', formData);
			// console.log('file: ', file);

			api
				.upload('/api/challenges', {
					title: newChallengeTitle,
					image: file
				})
				.then(() => {
					newChallengeTitle.val('');
					newChallengeImage.val('');
				})
				.then(res => {
					// console.log(res);
					store.challenges = res;
					render();
				})
				.catch(handleErrors());
			$('#challenge-overlay').removeClass('is-visible is-selected');
		});
  }
  
  function newSubmissionListener() {
    $('#new-submission').on('click', '#new-submission-button', event => {
			event.preventDefault();
			$('#modal-submission-form').removeClass('hidden');
			$('#modal-submission-form').addClass('is-selected');
			$('#submission-overlay').addClass('is-visible is-selected');
		});
  }

	function submissionFormSubmit() {
		$('.js-new-submission').on('submit', event => {
			event.preventDefault();

      const file = document.getElementById('submission-image').files[0];
      // console.log('file: ', file);

      const challengeId = store.currentChallenge;

			api
				.create(`/api/challenges/${challengeId}/submissions`) 
				.then(() => {
					file.val('');
					// return api.search('/auth/users/submissions');
				})
				.then(response => {
					store.submissions = response;
					render();
				})
        .catch(handleErrors());
        $('#submission-overlay').removeClass('is-visible is-selected');
		});
	}

	function signupSubmit() {
		$('#js-signup-form').on('submit', event => {
			event.preventDefault();

			const signupForm = $(event.currentTarget);
			const newUser = {
				username: signupForm.find('#signup-username').val(),
				password: signupForm.find('#signup-password').val()
			}; // in api.js
			api
				.create('/api/users', newUser)
				.then(res => {
					signupForm[0].reset(); //clear storage
					showSuccessMsg(
						`Thank you, ${res.username}! Signup successful. Please login.`
					);
					$('.modal-overlay').removeClass('is-visible');
					$('.aux-nav').removeClass('hidden');
					// $('.main-nav').addClass('hidden');
          $('#new-challenge').removeClass('hidden');
          
          // checkLoggedIn();

					$([document.documentElement, document.body]).animate(
						{
							scrollTop: $('.aux-nav').offset().top
						},
						2000
					);

				})
				.catch(handleErrors());
		});
	}

	function loginSubmit() {
		$('#js-login-form').on('submit', event => {
			event.preventDefault();

			const loginForm = $(event.currentTarget);
			const loginUser = {
				username: loginForm.find('#login-username').val(),
				password: loginForm.find('#login-password').val()
			};

			api
				.create('/api/login', loginUser)
				.then(res => {
          console.log('res: ', res);
          // store.user = ;
					store.authToken = res.authToken;
					localStorage.setItem('authToken', res.authToken);
					loginForm[0].reset();
					showSuccessMsg(`You've been logged in.`);

					return Promise.all([
						// get user's submissions
						api.search(`/api/submissions/`) // ${user}
					]);
				})
				.then(([submissions]) => {
					console.log(submissions);
					store.userSubmissions = submissions;

					yourSubmissionsListener(submissions);

					$('.modal-overlay').removeClass('is-visible');
          $('#new-challenge').removeClass('hidden');

          location.reload(); //otherwise, buttons don't return
        
					$([document.documentElement, document.body]).animate(
						{
							scrollTop: $('.aux-nav').offset().top
						},
						2000
					);
				});
		});
	}

	function yourSubmissionsListener(submissions) {
		$('#your-submissions').on('click', function() {
      console.log('your submissions button clicked')
			displayUserSubmissions(submissions);
			$([document.documentElement, document.body]).animate(
				{
					scrollTop: $('#challenges').offset().top
				},
				1000
			);
		});
	}

	function displayUserSubmissions(submissions) {
		console.log('displayUserSubmissions()');
		const submissionItems = submissions.map(
			submission =>
				`
        <div class="one-third" id="${submission.id}">
          <div class="content-overlay"></div>
            <img class="thumbnail" src="${submission.image}">
          </div>
        </div>
        `
		);
		$('#user-submissions').append(submissionItems);
	}

	function getSubmissions(challengeId) {
		console.log('getSubmissions');
		return api.search(`/api/challenges/${challengeId}`).then(res => {
      store.submissions = res;
      store.currentChallenge = challengeId;
			console.log(res);

			// $('#challenges').addClass('hidden');
			$('#submissions').removeClass('hidden');
			displaySubmissions(store.submissions);
		});
	}

	function displaySubmissions(submissions) {
		const submissionItems = submissions.map(
			submission =>
				`
      <div class="one-third" id="${submission._id}">
        <div class="content-overlay"></div>
        <img class="thumbnail" src="${submission.image}">
        <div class="content-details fadeIn-top">
          <h3>Submitted by:<br> ${submission.creator}</h3>
        </div>
      </div>
      `
		);
		$('#submissions').append(submissionItems);
    $('#challenges').addClass('hidden');
    $('main ul').removeClass('hidden');
    $('#back-button').removeClass('hidden');
    $('#new-challenge-button').addClass('hidden');

    if (isLoggedIn()){
      $('#new-submission').removeClass('hidden');
    } else {
      $('#new-submission').addClass('hidden');
    }
  }

  function backButtonListener() {
    $('#back-button').on('click', function(){
      console.log('clicked')
      // $('main ul').addClass('hidden');
      // $('#back-button').addClass('hidden');
      // $('#new-submission-button').addClass('hidden');
      // $('#submissions').addClass('hidden');
      // $('#submissions').empty();
      // $('#challenges').removeClass('hidden');
      // $('new-challenge-button').removeClass('hidden');

      location.reload(); //otherwise, buttons don't return
    })
  }

	function imageClickListener() {

  }

	function logout() {
    localStorage.removeItem('authToken');

    location.reload(); //otherwise, buttons don't return
  }

	function logoutListener() {
		$('.aux-nav').on('click', '#nav-logout', function() {
			logout();
		});
	}
});