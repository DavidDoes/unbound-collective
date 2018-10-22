'use strict';

$(document).ready(function() {
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
			app.render();
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
	});

	return {
		render: render,
		bindEventListeners: bindEventListeners
	};

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
        <div class="one-third card" id="${challenge.id}"><img class="thumbnail" src="${challenge.image}"><h2>${challenge.title}</h2>
        </div>
        `
    )
		$('#challenges').append(challengeItems);
  }

  function challengeClickListener(){
    $('.container').on('click', '.card', event => {
      const propId = $(event.currentTarget).prop('id');
      
      // convert to ObjectId:
      const challengeId = { "$oid": `${propId}` }
      const id = challengeId.$oid

      getSubmissions(id);
    });
  }
  
  function getSubmissions(id){
    console.log('getSubmissions() invoked')
    console.log(id);
    
    return api.search(`/api/challenges/${id}`).then(res => {
      store.submissions = res;
      console.log(res);

      render();
    })
  }

  // function displaySubmissions(){
  //   const submissionItems = submissions.map(
  //     submission => `
  //       <div class="on-third card"><img class="thumbnail" src="${submission.image}"><p>Uploaded by ${submission.creator}</p>
  //       </div
  //     `
  //   );
  //   $('#submissions').append(submissionItems);
  // }

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

	//
	function bindEventListeners() {
		submissionFormSubmit();
		signupSubmit();
		loginSubmit();

		// handleSubmissionSubmit()
	}

	function signupSubmit() {
		$('.js-signup-form').on('submit', event => {
			event.preventDefault();

			const signupForm = $(event.currentTarget);
			const newUser = {
				username: signupForm.find('.js-username-entry').val(),
				password: signupForm.find('.js-password-entry').val()
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
		$('.js-login-form').on('submit', event => {
			event.preventDefault();
			console.log('hello from loginSubmit()');

			const loginForm = $(event.currentTarget);
			const loginUser = {
				username: loginForm.find('.js-username-entry').val(),
				password: loginForm.find('.js-password-entry').val()
			};
			api
				.create('/api/login', loginUser)
				.then(res => {
					store.authToken = res.authToken;
					store.authorized = true;
					loginForm[0].reset();

					showSuccessMsg(`You've been logged in.`);

					return Promise.all([
						// get user's submissions
						api.search(`/api/users/${req.user.id}/submissions`)
					]);
				})
				.then(([submissions]) => {
					store.submissions = submissions;
					render();
				});
		});
	}
});
