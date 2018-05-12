App.include([
	'/bower_components/jquery-slimscroll/jquery.slimscroll.min.js',
	'/bower_components/fastclick/lib/fastclick.js',
	'/bower_components/chart.js/Chart.js',
	'/dist/js/adminlte.min.js',
	'/bower_components/jquery-knob/js/jquery.knob.js',
	'/bower_components/jquery-sparkline/dist/jquery.sparkline.min.js',
	'/App/Public/js/gauge.min.js',
	'/bower_components/moment/min/moment.min.js',
	'/plugins/input-mask/jquery.inputmask.js',
	'/plugins/input-mask/jquery.inputmask.date.extensions.js',
	'/plugins/input-mask/jquery.inputmask.extensions.js',
	'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
	'/bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
	'/bower_components/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js',
	'/plugins/timepicker/bootstrap-timepicker.min.js',

], function(){
  	home = new HomeController();
});

var home;

var HomeController = function(){
	var session = new Session;
  	var service = new Service;

	var start = function(){
	}

	
	var clickHandle = function(){
		$('#btn_upload_hargalistrik').click(function(e){
			uploadHargaListrik();
		});
	}

	var uploadHargaListrik = function(){
		var request = new Request;
	    var file = request.input($('#xlsHargaListrik')[0].files[0]).makeValid('required').save();
	    
	    if(request.isValid()){
	      submitHargaListrik(file);
	    }
	    else{
	      $.toaster({ priority : 'danger', title : 'Message', message : 'Lengkapi dengan benar form berikut!'});
	    }
	  
	}

	var submitHargaListrik = function(file){

      	$('#btn_upload_hargalistrik').html('Loading..');
      	$("#btn_upload_hargalistrik").prop("disabled", true);
		
		var formData = new FormData();
    	formData.append('thumbnail', file);

		service.startFormData({
		  data: formData,
	      type: 'post', 
	      uri: App.baseAPI() + '/data/upload',
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.status() == 200){
			$.toaster({ priority : 'success', title : 'Message', message: 'Upload sukses!'});
	      }
	      else{
	      	$.toaster({ priority : 'danger', title : 'Message', message: 'Upload gagal!'});
	      }


 	   		$('#btn_upload_hargalistrik').html('Update');
    	  $("#btn_upload_hargalistrik").removeAttr('disabled');

    	});
		
	}

	start();
  	clickHandle();
}