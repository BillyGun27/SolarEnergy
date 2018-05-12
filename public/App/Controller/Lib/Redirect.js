var Redirect = function(){}

Redirect.start = function(uri){
	this.startLoading();
	window.location = uri;
}

Redirect.startLoading = function(is_run = true){
	if(is_run)
		$.blockUI({
	        message: ' ',//$('#message'),
	        css: {
				color: 'white',
				backgroundColor:'none',
				border: '6px solid none',
				//borderRadius: '50%',
				borderTop: '6px solid white',
				//borderRight: '6px solid #71f442',
				//left: '48%',
				//width: '50px',
				height: '50px',
				'-webkit-animation': 'spin 1s linear infinite',
				animation: 'spin 1s linear infinite',
	        }
	    });
}

Redirect.stopLoading = function(is_run = true){
	if(is_run)
		$.unblockUI();
}
