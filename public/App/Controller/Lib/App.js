var App = function(){}

App.baseURL = function(){
	return conf.baseURL;
}

App.baseAPI = function(){
	return conf.baseAPI;
}

App.baseWEB = function(){
	return conf.baseWEB;
}

App.prototype.requireFile = function () {
	return [
		"/bower_components/jquery/dist/jquery.min.js",
	  	"/bower_components/bootstrap/dist/js/bootstrap.min.js",
	  	"/plugins/iCheck/icheck.min.js",
	  	"/plugins/BlockUI/jquery-BlockUI.js",
	  	"/App/Public/js/jquery.toaster.js",
	  	"/App/Controller/Lib/Redirect.js",
  		"/App/Controller/Lib/Session.js",
  		"/App/Controller/Lib/Service.js",
  		"/App/Controller/Lib/Request.js"
	];
}

App.prototype.includeFile = function(filename, callback, index = 0){
	var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

	script.src = App.baseWEB() + filename[index];
	script.type = 'text/javascript';

	script.onload = (filename.length - 1 > index) ?	
		function(){App.prototype.includeFile(filename, callback, index + 1)} : callback;

	head.appendChild(script);
}


App.is_include = false;
App.include = function(filename, callback = function(){}, index = 0){
	if(!this.is_include){
		this.is_include = true;
		filename = [...new Set([].concat(...this.prototype.requireFile(), ...filename))];
		this.prototype.includeFile(filename, callback);
	}
}

App.template = function(filename, callback, index = 0){
	$(filename[index][0]).hide();
	$(filename[index][0]).load(this.baseWEB() + filename[index][1], function() {
		$(filename[index][0]).show(500);
		(filename.length - 1 > index) ?	
			App.template(filename, callback, index + 1) : callback();
	});
}

App.getHash = function(){
	var hash = (window.location.hash).split('#');
	if(hash.length > 1)
		return hash[1];
	return hash[0];
}

App.random = function(min = 0, max = 0, fixed = 0){
	return (Math.random() * (max - min) + min).toFixed(fixed);
}

/*App.index_toast = 1;
App.toast = function(message = null, time = 3000){
	var x = document.getElementById('toast');
	var count = x.childNodes.length;
    
    if(count >= 3)
    	return;
	
    var newToast = document.createElement('div');
    newToast.innerHTML = message;
    newToast.className = 'toast';
    newToast.style = 'bottom: ' + (30*this.index_toast) + 'px';
    this.index_toast++;

	x.appendChild(newToast);
    setTimeout(function(){
    	App.index_toast = 1;
    	newToast.remove();
    }, time);
}
*/