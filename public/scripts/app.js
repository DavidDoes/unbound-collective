'use strict';
// const app = (function () {

$(document).ready(function() {
	render();

	// const files;

	// $('input[type=file]').on('change', prepareUpload);

	// function prepareUpload(event){
	//   files = event.target.files;
	// }

	function showSuccessMsg(msg) {
		const listener = $('.js-success-msg');
		listener.text(msg).show();
		setTimeout(() => listener.fadeOut('slow'), 2000);
	}

	function showFailMsg(msg) {
		const listener = $('.js-fail-msg');
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

		// const submissions = displaySubmissions(store.submissions);
		// $('.js-submissions').html(submissions);
	}

	$(function() {
		render();
		challengeClickListener();
		getChallenges();

		submissionFormSubmit();
		challengeFormSubmit();
		signupSubmit();
		loginSubmit();
	});

	if (isLoggedIn()) {
    $('#nav-logout').removeClass('hidden');
    $('.modal-overlay').removeClass('is-visible');
    $('.main-nav').addClass('hidden');
    $('#dashboard').removeClass('hidden');
  } // showHero() if logged out?

	function isLoggedIn() {
		return store.authToken ? true : false;
	}

	function hideHero() {
		$('hero-image').hide('slow');
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
        <img class="thumbnail content-image" src="${challenge.image}">
        <div class="content-details fadeIn-top">
        <h3>${challenge.title}</h3>
        </div>
        </div>
        `
		);
		$('#challenges').append(challengeItems);
	}

	function challengeClickListener() {
		$('.container').on('click', '.one-third', event => {
			const challengeId = $(event.currentTarget).prop('id');
			console.log(challengeId);

			getSubmissions(challengeId);
		});
	}

	function getSubmissions(challengeId) {
		console.log('getSubmissions');
		return api.search(`/api/challenges/${challengeId}`).then(res => {
			store.submissions = res;
			console.log(res);
		});
	}

	function displaySubmissions() {
		const submissionItems = submissions.map(
			submission =>
				`
      <div class="one-third" id="${
				submission.id
			}"><div class="content-overlay"></div>
      <img class="thumbnail content-image" src="${submission.image}">
      <div class="content-details fadeIn-top">
      <h3>${submission.creator}</h3>
      </div>
      </div>
      `
		);
		$('#submissions').append(submissionItems);
		$('#submission-upload').show('slow');
		$('#challenges').hide('slow');
	}

	function challengeFormSubmit() {
		$('.js-new-challenge').on('submit', event => {
			event.preventDefault();
			console.log('challengeFormSubmit() invoked');

			const newChallengeTitle = $('.js-title-input');
			const newChallengeImage = $('.js-challenge-upload');

			const formData = new FormData();
			formData.append('image', $('input[type=file]')[0].files[0]);
			console.log(formData);

			api
				.upload('/api/challenges', {
					title: newChallengeTitle.val(),
					image: newChallengeImage.val()
				})
				.then(() => {
					newChallengeTitle.val('');
					newChallengeImage.val('');
					return api.search(`/api/challenges/`);
				})

				.then(res => {
					console.log(res);
					store.challenges = res;
					render();
				})
				.catch(handleErrors);
		});
	}

	function submissionFormSubmit() {
		$('.js-upload').on('submit', event => {
			event.preventDefault();

			const newSubmissionListener = $('.js-file-input');

			api
				.create('/auth/submit/')
				.then(() => {
					newSubmissionListener.val('');
					return api.search('/auth/users/submissions');
				})

				.then(response => {
					store.submissions = response;
					render();
				})
				.catch(handleErrors);
		});
	}

	function signupSubmit() {
		$('#js-signup-form').on('submit', event => {
			console.log('signupSubmit() invoked');
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
					console.log('user created');
				})
				.catch(handleErrors);
		});
	}

	function loginSubmit() {
		$('#js-login-form').on('submit', event => {
			event.preventDefault();
			console.log('hello from loginSubmit()');

			const loginForm = $(event.currentTarget);
			const loginUser = {
				username: loginForm.find('#login-username').val(),
				password: loginForm.find('#login-password').val()
			};
			api
				.create('/api/login', loginUser)
				.then(res => {
					console.log('res: ', res);
					store.authToken = res.authToken;
					localStorage.setItem('authToken', res.authToken);
					store.authorized = true;
					loginForm[0].reset();

					showSuccessMsg(`You've been logged in.`);

					return Promise.all([
						// get user's submissions
						api.search(`/api/submissions/`)
					]);
				})
				.then(([submissions]) => {
          isLoggedIn();
          $([document.documentElement, document.body]).animate({
            scrollTop: $('#dashboard').offset().top
          }, 2000)
					console.log(submissions);

					store.submissions = submissions;
					// render();
				});
		});
	}
});
