'use strict';
// const app = (function () {

$(document).ready(function() {

	function showFailMsg(message) {
    $('.spinner').addClass('hidden');

    $('.js-err-msg').removeClass('hidden');
		const listener = $('.js-err-msg');
		listener.text(message).show();
	}

	function handleErrors(err) {

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
    editClickListener();
	});

  // check for store.authToken
	function isLoggedIn() {
    return store.authToken ? true : false;
	}

  // render Nav depending on logged in status
	function renderNav() {
		if (isLoggedIn()) {
			$('.hero-image').addClass('hidden');
      $('.main-nav').addClass('hidden');
      $('#aux-nav-wrapper').removeClass('hidden');
      $('#new-challenge').removeClass('hidden');
      $('#about')
        .empty()
        .append(`<h2>All Challenges</h2>`);
      $('#username-heading')
        .removeClass('hidden')
        .append(`
        <p>Welcome, ${localStorage.username}</p>`
      );
		} else {
      $('#about').css('padding-top', '2em');
			$('.hero-image').removeClass('hidden');
			$('#aux-nav-wrapper').addClass('hidden');
      $('.main-nav').removeClass('hidden');
      $('#new-challenge').addClass('hidden');
			$('#username-heading').addClass('hidden');
		}
	}

  // mobile drop-down menu toggle
	function navbarClickListener() {
		$('.user-navbar').on('click', () => {
      $('.js-menu').toggleClass('active');
      $('#fullscreen').addClass('hidden');
    });

    $('.user-navbar').on('click', '.nav-links', () => {
      $('.js-menu').toggleClass('active');
      $('#fullscreen').addClass('hidden');  
    });  

    $('.aux-nav').on('click', '.nav-links', () => {
      $('.js-menu').toggleClass('active');
      $('#fullscreen').addClass('hidden');
    })
	}

	function getChallenges() {
		return api.search('/api/challenges').then(res => {
			store.challenges = res;

			$('#back-button').removeClass('hidden');

			render();
		});
	}

	function displayChallenges(challenges) {
		const challengeItems = challenges.map(
			challenge =>
				`
        <div class='one-third challenge-thumb' id='${
					challenge.id
				}'><div class='content-overlay'></div>
          <img class='thumbnail' src='${challenge.image}'>
          <div class='content-details fadeIn-top'>
          <h3>${challenge.title}</h3>
          </div>
        </div>
        `
		);

		$('#back-button').addClass('hidden');
    $('#challenges').empty();
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
      const challengeId = $(event.currentTarget)
        .prop('id');

      const title = $(event.currentTarget)
        .children(2)
        .text();

        store.currentChallenge = { challengeId }
        store.currentChallengeTitle = title
      
      $('#about').empty();
      $('#user-challenges')
        .addClass('hidden')
        .empty();

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
      
      $('.spinner').removeClass('hidden');

			const newChallengeTitle = $('.js-title-input').val();
			const file = $('#image')[0].files;
			const imgFile = file.item(0);

			let formData = new FormData();

			formData.append('image', imgFile);
			formData.append('title', newChallengeTitle);

			api
				.upload('/api/challenges', formData)
				.then(() => {
          $('.spinner').addClass('hidden');
					$('#challenge-overlay').removeClass('is-visible is-selected');
          $('#challenges').empty();
          $('.js-title-input').val('');
          $('#image').val('');
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
      
      $('.spinner').removeClass('hidden');

			const challengeId = store.currentChallenge;

			const file = $('#submission-image')[0].files;
			const imgFile = file.item(0);

			let formData = new FormData();

			formData.append('image', imgFile);

			api
				.upload(`/api/challenges/${challengeId}/submissions`, formData)
				.then(res => {
          store.currentSubmission = res;
          console.log(store.currentSubmission);
				})
				.then(() => {
					getSubmissions(store.currentChallenge);
				})
				.then(() => {
          $('#submission-overlay').removeClass('is-visible is-selected');
          $('#submissions')
            .empty()
            .removeClass('hidden')
          $('.js-submission-upload').val('');
          $('.spinner').addClass('hidden');
          $('#image').val('');
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
				.then(() => {
					signupForm[0].reset();
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
						api.search(`/api/submissions/`)
					]);
        })
        .then(res => {
          store.submissions = res;
          console.log(store.submissions);
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

  // Click listener for user's My Submissions link
	function mySubmissionsListener() {
		$('#my-submissions').on('click', function() {
			return api.search(`/api/users/mysubmissions`).then(res => {
        $('.js-menu').removeClass('active');
				$('#user-submissions').empty();
				store.userSubmissions = res;

				displayUserSubmissions(res);
			});
		});
	}

  // Click listener for user's My Challenges link
	function myChallengesListener() {
		$('#my-challenges').on('click', function() {
			return api.search(`/api/users/mychallenges`).then(res => {
        $('.js-menu').removeClass('active');
				$('#user-challenges').empty();
				store.userChallenges = res;

				displayUserChallenges(res);
			});
		});
	}

	function displayUserSubmissions(submissions) {
    $('#about')
      .empty()
      .append(`<h2>My Submissions</h2>`);
		$('#back-button').removeClass('hidden');
    $('#new-challenge').addClass('hidden');
    $('#new-submission').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
    $('#user-challenges')
      .addClass('hidden')
      .hide()
      .empty();
    $('#user-submissions')
      .removeClass('hidden')
		  .show();
    $('ul').removeClass('hidden');
    
		const submissionItems = submissions.map(
      submission =>
				`
        <div class='one-third submission-thumb' id='${submission._id}'>
          <div class='content-overlay'></div>
            <img class='thumbnail' src='${submission.image}'>
            <div class='content-details fadeIn-top'>
              <h3>Submitted to Challenge:<br> ${submission.challenge.title}</h3>
              <button class='delete-submission nav-button'>Delete</button>
            </div>
          </div>
        </div>
        `
		);

		$('#user-submissions').append(submissionItems);
	}

	function displayUserChallenges(challenges) {
    $('#about')
      .empty()
      .append(`
      <h2>My Challenges</h2>
    `)
		$('#back-button').removeClass('hidden');
    $('#new-challenge').addClass('hidden');
    $('#new-submission').addClass('hidden');
		$('#challenges').addClass('hidden');
		$('#submissions').addClass('hidden');
    $('#user-challenges')
      .removeClass('hidden')
		  .show();
    $('#user-submissions')
      .addClass('hidden')
      .empty()
		  .hide();
		$('#new-challenge').addClass('hidden');
		$('ul').removeClass('hidden');

		$('#user-challenges').append(`
    <div class='modal-overlay' id='edit-challenge-overlay'>
    <div class='modal-wrapper'>
      <ul class='modal-tabs'>
        <li><a>Edit Title</a></li>
      </ul>

      <div id='modal-edit-title-form hidden'>
        <form role='form' class='form' id='js-edit-title-form'>
          <p>Only update the title if you've made a spelling error, or have submitted the Challenge in the last few minutes and want to change the title.</p>
          <div>
            <input type='text' name='newTitle' id='new-title' class='js-new-title-input' placeholder='Enter new title' required>
          </div>
          <input type='submit' value='Submit' class='nav-button'>
        </form>
      </div>
    </div>
  </div>
  `);

		const challengeItems = challenges.map(
			challenge =>
				`
      <div class='one-third challenge-thumb' id='${challenge._id}'>
      <div class='content-overlay'></div>
        <img class='thumbnail' src='${challenge.image}'>
        <div class='content-details fadeIn-top'>
          <h3>${challenge.title}</h3><br>
          <button class='edit-challenge nav-button'>Change Title</button>
          <input type='text' name='newTitle' class='js-edit-title-input hidden' placeholder='Enter new title in case of error.' required>
          <button type=submit class='edit-title-submit nav-button hidden'>Submit</button>
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
        <div class='one-third submission-thumb' id='${submission._id}'>
          <div class='content-overlay'></div>
          <img class='thumbnail' src='${submission.image}'>
          <div class='content-details fadeIn-top'>
            <h3>Submitted by:<br>${submission.creator.username}</h3>
          </div>
        </div>
        `
		);
		$('#submissions').append(submissionItems);
    $('#challenges').addClass('hidden');
    $('#about')
      .empty()
      .append(`<h2>${store.currentChallengeTitle}</h2>`);
		$('main ul').removeClass('hidden');
		$('#new-challenge').addClass('hidden');
		$('#back-button').removeClass('hidden');

		if (isLoggedIn()) {
			$('#new-submission').removeClass('hidden');
		} else {
			$('#new-submission').addClass('hidden');
		}
	}

  // When user clicks submission thumbnail, enlarge.
  // When user clicks out or hits esc, return to all submissions.
	function submissionClickListener() {
		$('.container').on('click', '.submission-thumb', event => {

			const src = $(event.target)
				.siblings('.thumbnail')
        .attr('src');
        
      $('#fullscreen')
        .fadeIn()
        .removeClass('hidden')
        .css({ '-webkit-transform': 'translate(0px, -500px)' });
			$('#fullscreen img').attr('src', src);
      // close fullscreen on click outside image
			$('#fullscreen').click(function() {
				$(this).fadeOut();
        $(this).addClass('hidden');
      });
      // close fullscreen on esc key
			$([document.documentElement, document.body]).animate({
				scrollTop: $('#fullscreen').offset().top - 100
			}),
      $(document).keyup(event => {
        if (event.which == '27') {
          $('#fullscreen').addClass('hidden');
        }
      });
		});
	}

  // Click listener for submission delete button on user's own submission
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
            return api
            .search(`/api/users/mysubmissions`)
            .then(res => {
              $('#user-submissions').empty();
              store.userSubmissions = res;
      
              displayUserSubmissions(res);
        	  })
          });
		    }
    });
  }
  
  function editClickListener() {
    $('.container').on('click', '.edit-challenge', event => {
      event.stopPropagation();

      const challengeId = $(event.currentTarget)
        .parents('.challenge-thumb')
        .prop('id');
      const title = $(event.currentTarget)
        .siblings('h3')
        .text();

        console.log('challengeId', challengeId)
        console.log('title: ', title)

        store.currentChallenge = { challengeId }
        store.currentChallengeTitle = { title }

      $('#modal-edit-title-form')
        .removeClass('hidden')
        .addClass('is-selected');
        
      $('#edit-challenge-overlay')
        .addClass('is-visible is-selected');

      // close modal on esc
      $(document).keyup(event =>{
        if(event.which == '27'){
          $('#edit-challenge-overlay').removeClass('is-visible');
        }
      });

      // close modal on click outside modal
      $('.modal-overlay').on('click', event =>{
        if( $(event.target).is(this) ){
          $(this).removeClass('is-visible');
        }
      });

      editTitleSubmit(challengeId);
    })
  }

  // handle PUT request from editClickListener
  function editTitleSubmit(challengeId) {
    $('#js-edit-title-form').on('submit', event => {
      event.stopImmediatePropagation();
      
      const newTitleValue = $('.js-new-title-input').val();
      const newTitle = {
        title: newTitleValue
      }

      api.update(`/api/challenges/${challengeId}`, newTitle)
        .then(() => {
					$('.modal-overlay').removeClass('is-visible');
        })
        .catch(err => {
          showFailMsg(err.responseJSON.message);
          handleErrors();
        })
    })
  }

  // back button and home link listener
	function backHomeClickListener() {
		$('.nav-right').on('click', '#home', () => {
      $('#about')
        .empty()
        .append(`<h2>All Challenges</h2>`);
      $('#challenges').removeClass('hidden');
      $('#new-submission').addClass('hidden');
      $('#submissions')
        .empty()
        .addClass('hidden');
      $('#user-submissions')
        .addClass('hidden')
        .empty();
      $('#user-challenges')
        .addClass('hidden')
        .empty();
      $('#back-button').addClass('hidden');
      $('#fullscreen').addClass('hidden');

      if (isLoggedIn()) {
        $('#new-challenge').removeClass('hidden');
      } else {
        $('#new-challenge').addClass('hidden');
      }
		});

		$('.aux-nav').on('click', '#home', () => {
      $('#about')
        .empty()
        .append(`<h2>All Challenges</h2>`);      $('#challenges').removeClass('hidden');
      $('#new-challenge').removeClass('hidden');
      $('#new-submission').addClass('hidden');
      $('#submissions')
        .empty()
        .addClass('hidden');
      $('#user-submissions')
        .addClass('hidden')
        .empty();
      $('#user-challenges')
        .addClass('hidden')
        .empty();
      $('#back-button').addClass('hidden');
      $('#fullscreen').addClass('hidden');

      if (isLoggedIn()) {
        $('#new-challenge').removeClass('hidden');
      } else {
        $('#new-challenge').addClass('hidden');
      }
		});

		$('#back-button').on('click', () => {
      $('#about')
        .empty()
        .append(`<h2>All Challenges</h2>`);      $('#challenges').removeClass('hidden');
      $('#new-submission').addClass('hidden');
      $('#submissions')
        .empty()
        .addClass('hidden');
      $('#user-submissions')
        .addClass('hidden')
        .empty();
      $('#user-challenges')
        .addClass('hidden')
        .empty();
      $('#back-button').addClass('hidden');
      $('#fullscreen').addClass('hidden');

      if (isLoggedIn()) {
        $('#new-challenge').removeClass('hidden');
      } else {
        $('#new-challenge').addClass('hidden');
      }
    });
    
    getChallenges();

  }

  // scroll back to top of page
	function topButtonScroller() {
		$(window).scroll(function() {
			if ($(this).scrollTop() > 100) {
				$('#nav-up-button').fadeIn();
			} else {
				$('#nav-up-button').fadeOut();
			}
		});
	}

  // click listener for scroll-to-top button
	function topButtonClickListener() {
		$('#nav-up-button').on('click', () => {
      $('html, body').animate({ 
        scrollTop: 0
       }, 'slow');
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