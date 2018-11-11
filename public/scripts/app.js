'use strict';
// const app = (function () {

$(document).ready(function() {

	function showFailMsg(message) {
    $('.lds-dual-ring').addClass('hidden');

    $('.js-err-msg').removeClass('hidden');
		const listener = $('.js-err-msg');
		listener.text(message).show();
	}

	function handleErrors(err) {
    console.log('handleErrors() invoked')

		if (err.status === 401) {
      console.error(err);
			render();
		}
    showFailMsg(err.responseJSON.message);
    
    if(err.status === 422) {
      console.error(err);
      render();
    }
    showFailMsg(err.responseJSON.message);	
  }

	function render() {
		const challenges = displayChallenges(store.challenges);
    $('.js-challenges').html(challenges);
	}

	$(function() {
		renderNav();
		topButtonClickListener();
		topButtonScroller();

		navbarClickListener();
		discoverClickListener();

		challengeClickListener();
		submissionClickListener();

		getChallenges();

		submissionFormSubmit();
		challengeFormSubmit();

		signupSubmit();
		loginSubmit();
		logoutListener();

		mySubmissionsListener();
		myChallengesListener();

		newChallengeListener();
		newSubmissionListener();

		backHomeClickListener();
		deleteClickListener();
	});

	function isLoggedIn() {
    console.log('isLoggedIn() run')
    return store.authToken ? true : false;
	}

	function renderNav() {
		if (isLoggedIn()) {
			$('.hero-image').addClass('hidden');
      $('.main-nav').addClass('hidden');
      $('#aux-nav-wrapper').removeClass('hidden');
      $('#username-heading').removeClass('hidden');
      $('#username-heading').append(`
        <h2>Welcome, ${localStorage.username}</h2>`
      );
		} else {
			$('.hero-image').removeClass('hidden');
			$('#aux-nav-wrapper').addClass('hidden');
			$('.main-nav').removeClass('hidden');
			$('#username-heading').addClass('hidden');
		}
	}

	function navbarClickListener() {
		$('.js-navbar-toggle').on('click', () => {
			$('.js-menu').toggleClass('active');
		});
	}

	function getChallenges() {
		return api.search('/api/challenges').then(res => {
			store.challenges = res;
			res.map(challenge => {
				store.currentChallengeTitle = challenge.title;
			});
			$('#back-button').removeClass('hidden');

			render();
		});
	}

	function displayChallenges(challenges) {
		const challengeItems = challenges.map(
			challenge =>
				`
        <div class="one-third challenge-thumb" id="${
					challenge.id
				}"><div class="content-overlay"></div>
          <img class="thumbnail" src="${challenge.image}">
          <div class="content-details fadeIn-top">
          <h3>${challenge.title}</h3>
          </div>
        </div>
        `
		);

		$('#back-button').addClass('hidden');

		$('#challenges').append(challengeItems);

		if (isLoggedIn()) {
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
		$('.container').on('click', '.challenge-thumb', event => {
			const challengeId = $(event.currentTarget).prop('id');

			$('#user-challenges').addClass('hidden');
      $('#user-challenges').empty();

			getSubmissions(challengeId);
		});
	}

	function newChallengeListener() {
		$('#new-challenge').on('click', '#new-challenge-button', event => {
			event.preventDefault();
			$('#modal-challenge-form').removeClass('hidden');
			$('#modal-challenge-form').addClass('is-selected');
			$('#challenge-overlay').addClass('is-visible is-selected');
		});
	}

	function challengeFormSubmit() {
		$('#js-new-challenge-form').on('submit', event => {
      event.preventDefault();
      
      $('.lds-dual-ring').removeClass('hidden');

			const newChallengeTitle = $('.js-title-input').val();
			const file = $('#image')[0].files;
			const imgFile = file.item(0);

			let formData = new FormData();

			formData.append('image', imgFile);
			formData.append('title', newChallengeTitle);

			api
				.upload('/api/challenges', formData)
				.then(() => {
          $('.lds-dual-ring').addClass('hidden');
					$('#challenge-overlay').removeClass('is-visible is-selected');
					$('#challenges').empty();
				})
				.then(() => {
					getChallenges();
				})
				.then(() => {
					$('#challenges').removeClass('hidden');
        })
        .catch(handleErrors);
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
		$('#js-new-submission-form').on('submit', event => {
      event.preventDefault();
      
      $('.lds-dual-ring').removeClass('hidden');

			const challengeId = store.currentChallenge;

			const file = $('#submission-image')[0].files;
			const imgFile = file.item(0);

			let formData = new FormData();

			formData.append('image', imgFile);

			api
				.upload(`/api/challenges/${challengeId}/submissions`, formData)
				.then(() => {
					$('#submission-overlay').removeClass('is-visible is-selected');
					$('#submissions').empty();
				})
				.then(() => {
					getSubmissions(store.currentChallenge);
				})
				.then(() => {
          $('#submissions').removeClass('hidden');
          $('.lds-dual-ring').addClass('hidden');
				})
				.catch(err => {
          showFailMsg(err.responseJSON.message);
				});
		});
	}

	function signupSubmit() {
		$('#js-signup-form').on('submit', event => {
			event.preventDefault();

			const signupForm = $(event.currentTarget);
			const newUser = {
				username: signupForm.find('#signup-username').val(),
				password: signupForm.find('#signup-password').val()
			};

			api
				.create('/api/users', newUser)
				.then(res => {
					signupForm[0].reset(); //clear storage
					$('.modal-overlay').removeClass('is-visible');
					$('.aux-nav').removeClass('hidden');
					$('#new-challenge-button').removeClass('hidden');

					$([document.documentElement, document.body]).animate(
						{
							scrollTop: $('.aux-nav').offset().top
						},
						2000
					);
				})
        // .catch(handleErrors);
        .catch(err => {
          showFailMsg(err.responseJSON.message);
          handleErrors();
        })
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
					store.authToken = res.authToken;
					localStorage.setItem('authToken', res.authToken);
					localStorage.setItem('username', loginUser.username);
					loginForm[0].reset();

					return Promise.all([
						// get user's submissions
						api.search(`/api/submissions/`) // ${user}
					]);
				})
				.then(() => {
          location.reload();
					$('.modal-overlay').removeClass('is-visible');
          $('#new-challenge').removeClass('hidden');
        })
        .catch(err => {
          showFailMsg(err.responseJSON.message);
        })
		});
	}

	function mySubmissionsListener() {
		$('#my-submissions').on('click', function() {
			return api.search(`/api/users/mysubmissions`).then(res => {
				$('#user-submissions').empty();
				store.userSubmissions = res;

				displayUserSubmissions(res);
			});
		});
	}

	function myChallengesListener() {
		$('#my-challenges').on('click', function() {
			return api.search(`/api/users/mychallenges`).then(res => {
				$('#user-challenges').empty();
				store.userChallenges = res;

				displayUserChallenges(res);
			});
		});
	}

	function displayUserSubmissions(submissions) {
		$('#back-button').removeClass('hidden');
    $('#new-challenge').addClass('hidden');
    $('#new-submission').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
		$('#user-challenges').addClass('hidden');
		$('#user-challenges').hide();
		$('#user-submissions').removeClass('hidden');
		$('#user-submissions').show();
		$('ul').removeClass('hidden');
		$('#user-challenges').empty();

		$('#user-submissions').append(`
      <h1>My Submissions</h1>
    `);

		const submissionItems = submissions.map(
			submission =>
				`
        <div class="one-third submission-thumb" id="${submission._id}">
          <div class="content-overlay"></div>
            <img class="thumbnail" src="${submission.image}">
            <div class="content-details fadeIn-top">
              <button class="delete-submission nav-button">Delete</button>
            </div>
          </div>
        </div>
        `
		);

		$('#user-submissions').append(submissionItems);
	}

	function displayUserChallenges(challenges) {
		$('#back-button').removeClass('hidden');
    $('#new-challenge').addClass('hidden');
    $('#new-submission').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
		$('#user-challenges').removeClass('hidden');
		$('#user-challenges').show();
		$('#user-submissions').addClass('hidden');
		$('#user-submissions').hide();
		$('#new-challenge').addClass('hidden');
		$('ul').removeClass('hidden');
		$('#user-submissions').empty();

		$('#user-challenges').append(`
    <h1>My Challenges</h1>
  `);

		const challengeItems = challenges.map(
			challenge =>
				`
      <div class="one-third challenge-thumb" id="${challenge._id}">
      <div class="content-overlay"></div>
        <img class="thumbnail" src="${challenge.image}">
        <div class="content-details fadeIn-top">
          <h3>${challenge.title}</h3>
        </div>
      </div>
      `
		);
		$('#user-challenges').append(challengeItems);
	}

	function getSubmissions(challengeId) {
		return api.search(`/api/challenges/${challengeId}`).then(res => {
			store.submissions = res;
			store.currentChallenge = challengeId;

			$('#submissions').removeClass('hidden');
			$('#back-button').removeClass('hidden');

			displaySubmissions(store.submissions);
		});
	}

	function displaySubmissions(submissions) {
		const submissionItems = submissions.map(
			submission =>
				`
        <div class="one-third submission-thumb" id="${submission._id}">
          <div class="content-overlay"></div>
          <img class="thumbnail" src="${submission.image}">
          <div class="content-details fadeIn-top">
            <h3>Submitted by:<br>${submission.creator}</h3>
          </div>
        </div>
        `
		);
		$('#submissions').append(submissionItems);
		$('#challenges').addClass('hidden');
		$('main ul').removeClass('hidden');
		$('#new-challenge').addClass('hidden');
		$('#back-button').removeClass('hidden');

		if (isLoggedIn()) {
			$('#new-submission').removeClass('hidden');
		} else {
			$('#new-submission').addClass('hidden');
		}
	}

	function submissionClickListener() {
		$('.container').on('click', '.submission-thumb', function(event) {
			const src = $(this)
				.children('.thumbnail')
				.attr('src');

			$('#fullscreen').removeClass('hidden');
			$('#fullscreen img').attr('src', src);
			$('#fullscreen').fadeIn();
			$('#fullscreen').css({ '-webkit-transform': 'translate(0px, -900px)' });

			$('#fullscreen').click(function() {
				$(this).fadeOut();
				$(this).addClass('hidden');
			});

			$([document.documentElement, document.body]).animate({
				scrollTop: $('#fullscreen').offset().top
			}),
				$(document).keyup(function(event) {
					if (event.which == '27') {
						$('#fullscreen').addClass('hidden');
					}
				});
		});
	}

	function deleteClickListener() {
		$('.container').on('click', '.delete-submission', event => {
			event.stopImmediatePropagation();
			const submission = $(event.currentTarget)
				.parents('.submission-thumb')
				.prop('id');

			if (
				confirm(
					'Are you sure that you would like to permanently remove this submission?'
				)
			) {
				api
					.remove(`/api/submissions/${submission}`)
					.then(() => {
						$('#submissions').empty();
					})
					.then(() => {
						getSubmissions(store.currentChallenge);
					})
					.then(() => {
						$('#submissions').removeClass('hidden');
					});
			}
		});
	}

	function backHomeClickListener() {
		$('.main-nav').on('click', '#home', () => {
      $('#challenges').removeClass('hidden');
      $('#new-submission').addClass('hidden');
			$('#submissions').empty();
			$('#submissions').addClass('hidden');
			$('#user-submissions').addClass('hidden');
			$('#user-challenges').addClass('hidden');
			$('#user-submissions').empty();
      $('#user-challenges').empty();
      $('#back-button').addClass('hidden');
		});

		$('.aux-nav').on('click', '#home', () => {
      $('#challenges').removeClass('hidden');
      $('#new-challenge').removeClass('hidden');
      $('#new-submission').addClass('hidden');
			$('#submissions').empty();
			$('#submissions').addClass('hidden');
			$('#user-submissions').addClass('hidden');
			$('#user-challenges').addClass('hidden');
			$('#user-submissions').empty();
      $('#user-challenges').empty();
      $('#back-button').addClass('hidden');
		});

		$('#back-button').on('click', () => {
      $('#challenges').removeClass('hidden');
      $('#new-challenge').removeClass('hidden');
      $('#new-submission').addClass('hidden');
			$('#submissions').empty();
			$('#submissions').addClass('hidden');
			$('#user-submissions').addClass('hidden');
			$('#user-challenges').addClass('hidden');
			$('#user-submissions').empty();
      $('#user-challenges').empty();
      $('#back-button').addClass('hidden');
    });
    
    getChallenges();
	}

	function topButtonScroller() {
		$(window).scroll(function() {
			if ($(this).scrollTop() > 100) {
				$('#nav-up-button').fadeIn();
			} else {
				$('#nav-up-button').fadeOut();
			}
		});
	}

	function topButtonClickListener() {
		$('#nav-up-button').on('click', () => {
			$([document.documentElement, document.body]).animate({
				scrollTop: $('nav').offset().top
			});
		});
	}

	function logout() {
    localStorage.removeItem('authToken');
    store.authToken = null;
		localStorage.removeItem('username');
		location.reload();
	}

	function logoutListener() {
		$('.aux-nav').on('click', '#nav-logout', () => {
			logout();
		});
	}
});