$(document).ready(function($){
	const $form_modal = $('.modal-overlay'),
		$form_login = $form_modal.find('#modal-login-form'),
		$form_signup = $form_modal.find('#modal-signup-form'),
		$form_modal_tab = $('.modal-tabs'),
		$tab_login = $form_modal_tab.children('li').eq(0).children('a'),
		$tab_signup = $form_modal_tab.children('li').eq(1).children('a'),
    $main_nav = $('.main-nav');

	//open modal
	$main_nav.on('click', function(event){
		if( $(event.target).is($main_nav) ) {
      console.log('$main_nav targeted')
			// on mobile open the submenu
			$(this).children('ul').toggleClass('is-visible');
		} else {
			// on mobile close submenu
			$main_nav.children('ul').removeClass('is-visible');
			//show modal layer
      $form_modal.addClass('is-visible');	
			//show the selected form
			( $(event.target).is('#nav-signup') ) ? signup_selected() : login_selected();
		}
  });

	// close modal on esc
	$(document).keyup(function(event){
    if(event.which == '27'){
      $form_modal.removeClass('is-visible');
    }
  });

  // close modal on click outside modal
  $('.modal-overlay').on('click', function(event){
    if( $(event.target).is($form_modal) || $(event.target).is('.close-form')){
      $form_modal.removeClass('is-visible');
    }
  });

	//switch from a tab to another
	$form_modal_tab.on('click', function(event) {
    event.preventDefault();
    ( $(event.target).is( $tab_login ) ) ? login_selected() : signup_selected();
	});

	function login_selected(){
		$form_login.addClass('is-selected');
		$form_signup.removeClass('is-selected');
		$tab_login.addClass('selected');
		$tab_signup.removeClass('selected');
	}

	function signup_selected(){
    console.log('signup_selected()')

		$form_login.removeClass('is-selected');
		$form_signup.addClass('is-selected');
		$tab_login.removeClass('selected');
		$tab_signup.addClass('selected');
	}
});