$(document).ready(function($){
	const $form_modal = $('.modal-overlay'),
		$form_login = $form_modal.find('.modal-login-form'),
		$form_signup = $form_modal.find('.modal-signup-form'),
		$form_forgot_password = $form_modal.find('#forgot-password'),
		$form_modal_tab = $('.modal-tabs'),
		$tab_login = $form_modal_tab.children('li').eq(0).children('a'),
		$tab_signup = $form_modal_tab.children('li').eq(1).children('a'),
		$forgot_password_link = $form_login.find('#forgot-password a'),
		$back_to_login_link = $form_forgot_password.find('#forgot-password a'),
		$main_nav = $('.main-nav');

	//open modal
	$main_nav.on('click', function(event){
    console.log('login/signup clicked')

		if( $(event.target).is($main_nav) ) {
      console.log('$main_nav targeted')
			// on mobile open the submenu
			$(this).children('ul').toggleClass('is-visible');
		} else {
      console.log('.modal-overlay opened')
			// on mobile close submenu
			$main_nav.children('ul').removeClass('is-visible');
			//show modal layer
      $form_modal.addClass('is-visible');	
			//show the selected form
			( $(event.target).is('.js-signup-form') ) ? signup_selected() : login_selected();
		}

	});

	// close modal when clicking the esc keyboard button
	$(document).keyup(function(event){
    if(event.which == '27'){
      $form_modal.removeClass('is-visible');
    }
  });
  // close modal on click outside modal
  $('.modal-overlay').on('click', function(event){
    console.log('modal-overlay clicked')
    if( $(event.target).is($form_modal) || $(event.target).is('.close-form')){
      $form_modal.removeClass('is-visible');
    }
  });

	//switch from a tab to another
	$form_modal_tab.on('click', function(event) {
		event.preventDefault();
		( $(event.target).is( $tab_login ) ) ? login_selected() : signup_selected();
	});

	//show forgot-password form 
	$forgot_password_link.on('click', function(event){
		event.preventDefault();
		forgot_password_selected();
	});

	//back to login from the forgot-password form
	$back_to_login_link.on('click', function(event){
		event.preventDefault();
		login_selected();
	});

	function login_selected(){
    console.log('login_selected()')
		$form_login.addClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.addClass('selected');
		$tab_signup.removeClass('selected');
	}

	function signup_selected(){
    console.log('signup_selected()')

		$form_login.removeClass('is-selected');
		$form_signup.addClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.removeClass('selected');
		$tab_signup.addClass('selected');
	}

	function forgot_password_selected(){
		$form_login.removeClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.addClass('is-selected');
	}
});