App.include([
  "/App/Controller/Auth/js/AuthController.js"
], function(){
  	new LoginController;
});

var LoginController = function(){
	Redirect.startLoading();
	
	App.template([
		['#head', '/App/Template/head.shtml'],
		['#body', '/App/Template/Auth/login.shtml'],
		['#footer', '/App/Template/footer.shtml']
	], function(){
		start();
		Redirect.stopLoading();
	});


	var start = function(){
		var auth = new AuthController;

		$('input').iCheck({
		    checkboxClass: 'icheckbox_square-blue',
		    radioClass: 'iradio_square-blue',
		    increaseArea: '20%' // optional
		});

		$('body').click(function(e){
		    switch(e.target.id){
		      case 'btnLogin':
		      	auth.login();
		        break;
		      case 'btnLogout':
		        auth.logout();
		        break;
		      default:
		        break;
		    }
		});

	}
}