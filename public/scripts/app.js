'use strict';
// const app = (function () {

$(document).ready(function() {

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
    
    $('#username-heading').append(`
    <h2>${localStorage.username}</h2>
  `)
	}

	$(function() {
		renderNav();
    challengeClickListener();
    submissionClickListener();
		getChallenges();
		discoverClickListener();
		submissionFormSubmit();
		challengeFormSubmit();
		signupSubmit();
		loginSubmit();
		logoutListener();
		mySubmissionsListener();
		myChallengesListener();
		newChallengeListener();
		backButtonListener();
    newSubmissionListener();
    deleteClickListener();
	});

	function isLoggedIn() {
		return store.authToken ? true : false;
	}

	function renderNav() {
		if (isLoggedIn()) {
			$('.hero-image').addClass('hidden');
			$('.main-nav').addClass('hidden');
      $('.aux-nav').removeClass('hidden');
      $('#username-heading').removeClass('hidden');
		} else {
			$('.hero-image').removeClass('hidden');
			$('.aux-nav').addClass('hidden');
      $('.main-nav').removeClass('hidden');
      $('#username-heading').removeClass('hidden');
		}
	}

	function getChallenges() {
		return api.search('/api/challenges').then(res => {
      store.challenges = res;
      res.map(challenge => {
        store.currentChallengeTitle = challenge.title;
      })

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
			const file = document.getElementById('image').files[0];
			// const formData = new FormData();
      // formData.append('image', file);
      // console.log(formData);
			// formData.append('title', newChallengeTitle);

			// console.log('formData: ', formData);
			// console.log('file: ', file);

			api
				.upload('/api/challenges', {
					title: $('.js-title-input').val(),
					image: document.getElementById('image').files[0]
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
		$('#new-submission').on('submit', event => {
			event.preventDefault();

      const file = document.getElementById('submission-image').files[0];
			console.log('file: ', file);

      const challengeId = store.currentChallenge;

			api
				.upload(`/api/challenges/${challengeId}/submissions`, {
          image: file
        })
				.then(() => {
          file.val('');
          render();
				})
        .catch(err => {
          console.error(err);
        });
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
			};

			api
				.create('/api/users', newUser)
				.then(res => {
					signupForm[0].reset(); //clear storage
					$('.modal-overlay').removeClass('is-visible');
					$('.aux-nav').removeClass('hidden');
					$('#new-challenge').removeClass('hidden');

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
					localStorage.setItem('username', loginUser.username);
					loginForm[0].reset();
          showSuccessMsg(`You've been logged in.`);


					return Promise.all([
						// get user's submissions
						api.search(`/api/submissions/`) // ${user}
					]);
				})
				.then(() => {
					$('.modal-overlay').removeClass('is-visible');
          $('#new-challenge').removeClass('hidden');
					location.reload() //otherwise, buttons don't return
				});
		});
	}

	function mySubmissionsListener() {
		$('#my-submissions').on('click', function() {
      return api.search(`/api/users/mysubmissions`)
      .then(res => {
        $('#user-submissions').empty();
        store.userSubmissions = res;

				displayUserSubmissions(res);
			});
		});
	}

	function myChallengesListener() {
		$('#my-challenges').on('click', function() {
      return api.search(`/api/users/mychallenges`)
      .then(res => {
        $('#user-challenges').empty();
        store.userChallenges = res;

				displayUserChallenges(res);
			});
		});
	}

	function displayUserSubmissions(submissions) {

		$('#new-challenge').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
		$('#user-challenges').addClass('hidden');
		$('#user-challenges').hide();
		$('#user-submissions').removeClass('hidden');
		$('#user-submissions').show();
		$('#new-challenge-button').addClass('hidden');
		$('#back-button').removeClass('hidden');
		$('ul').removeClass('hidden');
		$('#user-challenges').empty();

		$('#user-submissions').append(`
      <h2>My Submissions</h2>
    `);

		const submissionItems = submissions.map(
			submission =>
				`
        <div class="one-third submission-thumb" id="${submission.id}">
          <div class="content-overlay"></div>
            <img class="thumbnail" src="${submission.image}">
            <div class="content-details fadeIn-top">
              <button class="delete-submission">Delete</button>
            </div>
          </div>
        </div>
        `
		);
		$('#user-submissions').append(submissionItems);
	}

	function displayUserChallenges(challenges) {

		$('#new-challenge').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
		$('#user-challenges').removeClass('hidden');
		$('#user-challenges').show();
		$('#user-submissions').addClass('hidden');
		$('#user-submissions').hide();
		$('#new-challenge-button').addClass('hidden');
		$('#back-button').removeClass('hidden');
		$('ul').removeClass('hidden');
    $('#user-submissions').empty();    

		$('#user-challenges').append(`
    <h2>My Challenges</h2>
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
    return api.search(`/api/challenges/${challengeId}`)
    .then(res => {
			store.submissions = res;
      store.currentChallenge = challengeId;

			$('#submissions').removeClass('hidden');
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
		$('#back-button').removeClass('hidden');
		$('#new-challenge-button').addClass('hidden');

		if (isLoggedIn()) {
      $('#new-submission').removeClass('hidden');
		} else {
      $('#new-submission').addClass('hidden');
		}
  }

  function submissionClickListener(){
    $('.container').on('click', '.submission-thumb', function(event){
      const src = $(this).children('.thumbnail').attr('src')

      $('#fullscreen').removeClass('hidden');
      $('#fullscreen img').attr('src', src);
      $('#fullscreen').fadeIn();
      $('#fullscreen').css({'-webkit-transform':'translate(0px, -900px)'})

      $('#fullscreen').click(function(){
        $(this).fadeOut();
        $(this).addClass('hidden');
      })

      $([document.documentElement, document.body]).animate(
				{
					scrollTop: $('#fullscreen').offset().top
				}),
      
      $(document).keyup(function(event){
        if(event.which == '27'){
          $('#fullscreen').addClass('hidden');
        }
      });
    });
  }
  
  function deleteClickListener(){
    $('.container').on('click', '.delete-submission', (event) => {
      const submission = $(event.currentTarget).parents('.submission-thumb').prop('id');

      if (confirm('Are you sure that you would like to permanently remove this submission?')) {
        console.log(submission);
        api.remove(`/api/submissions/${submission}`);
        location.reload();
      } 
    })
  }

	function backButtonListener() {
		$('#back-button').on('click', function() {
			location.reload(); //otherwise, buttons don't return
		});
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

