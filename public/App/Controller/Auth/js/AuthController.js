App.include(null, function(){
  new AuthController;
});


var AuthController = function(){
  var session = new Session;
  var service = new Service;


  if(session.get('token')){
    Redirect.start('../home');
  }
  
  var loginSubmit = function(email, password){
    var data = {
      email: email,
      password: password
    }

    service.start({
      type: 'post',
      uri: App.baseAPI() + '/auth/login',
      data: data
    }, function(){

      if(service.isSuccessful()){
        console.log(service.response());
        session.set('token', service.response().token);
        session.set('user', service.response().res[0].id);
        session.set('email', service.response().email);
        Redirect.start('../home');
      }
      else{
        session.destroy();
        $.toaster({ priority : 'error', title : 'Message', message : 'Invalid email or password!'});
      }

    });
  }

  this.login = function(){
    var request = new Request;
    var email = request.input($('input[name=email]').val()).makeValid('required').save();
    var password = request.input($('input[name=password]').val()).makeValid('required').save();

    if(request.isValid()){
      loginSubmit(email, password);
    }
    else{
      $.toaster({ priority : 'error', title : 'Message', message : 'Please, fill the forms correctly!'});
    }
  }

}
