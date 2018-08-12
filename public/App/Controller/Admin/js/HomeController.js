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
var duration = 6000;

var HomeController = function(){
	var transisi = true;
	var menu = App.getHash();
	
	var session = new Session;
  	var service = new Service;


  	if(!session.get('token')){
    	Redirect.start('../account/login');
  	}

	Redirect.startLoading();
	
	var body = '/App/Template/Admin/dashboard.shtml';
	if(menu == 'home')
		body = '/App/Template/Admin/dashboard.shtml';
	else if(menu == 'enerAss')
		body = '/App/Template/Admin/enerAss.shtml';
	else if(menu == 'appMon')
		body = '/App/Template/Admin/appMon.shtml';
	else if(menu == 'powMon')
		body = '/App/Template/Admin/powMon.shtml';
	else if(menu == 'enerSav')
		body = '/App/Template/Admin/enerSav.shtml';


	App.template([
		['#head', '/App/Template/head.shtml'],
		['#body', body],
		['#header', '/App/Template/Admin/header.shtml'],
		['#footer', '/App/Template/footer.shtml'],
		['#side', '/App/Template/Admin/side.shtml'],
	], function(){
		start();
		clickHandle();
		Redirect.stopLoading();
	});

	var jenisDay = 'day';
	var jenisDayEmission = 'day';
	var isToggle = false;
	var loop;
	var currentAsses;
	var currentId;
	var month = new Array();
	month[0] = "january";
	month[1] = "february";
	month[2] = "march";
	month[3] = "april";
	month[4] = "may";
	month[5] = "june";
	month[6] = "july";
	month[7] = "august";
	month[8] = "september";
	month[9] = "october";
	month[10] = "november";
	month[11] = "december";


	var start = function(){
		currentId = session.get('user');
		$('#userName').html(session.get('email'));

		if(menu == 'home' || menu == ''){
			drawGraphCompare();
			drawGraphEmission();
		}
		else if(menu == 'enerAss'){
			getAssesment();
			getLocation();

			getDaya();
			
			getRekomendasi();
			getDevice(true);
		}
		else if(menu == 'enerSav'){
			getSaving();
		}
		else if(menu == 'powMon'){
			drawGraphSolarPower();
			drawGraphGridPower();
		}


		startTask();
		
		loop = setInterval(function(){
			startTask();
		}, duration);
	}

	var startTask = function(){
		if(menu == 'home'  || menu == ''){
			getCountDevice();
			getLoadPower(jenisDay);
			getLoadEmission(jenisDayEmission);
		}
		else if(menu == 'enerAss'){
		}
		else if(menu == 'powMon'){
			getDataPower();
			getHistory('pln');
			getHistory('battery');
		}

		else if(menu == 'appMon'){
			getCountDevice();
			if(!isToggle) getDevice();
		}
	}

	var clickHandle = function(){

		$('body').click(function(e){
			//$.toaster({ priority : 'success', title : '', message : ''+e.target.id});
			switch(e.target.id){
		      default:
		        break;
		    }
		});

		$( window ).on( 'hashchange', function(e) {
    		rebuild();
		});

		$('#selectDay').change(function(e){
			jenisDay = $('#selectDay').val();
			getLoadPower(jenisDay);
		});

		$('#selectDayEmission').change(function(e){
			jenisDayEmission = $('#selectDayEmission').val();
			getLoadEmission(jenisDayEmission);
		});

		$('#saveAsses').click(function(e){
			saveAsses();
		});

		$('#btnLogout').click(function(e){
			logout();
		});
	}

	var logout = function(){
	    session.destroy();
	    Redirect.start('../account/login');
	 }

	var rebuild = function(){
		clearInterval(loop);
		$('body').unbind('click');
		if(transisi){
			transisi = false;
			setTimeout(function() { home = new HomeController; }, 100);
		}
	}

	var getRekomendasi = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/rekomendasi/' + currentId,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();	
			drawTableRekomendasi(data);
	      }

    	});
		
	}

	var drawTableRekomendasi = function(data){
		var container = $('#rekomendasiPower');
		var name = 'Rekomendasi Power';

		var templateFoot = ''+
					   '</table>'+
                  	'</div>'+
                  '</div>'+
                '</div>'
                +'';

			var templateHead = '' +
			'<div class="col-xs-12">' +
                '<div class="box">' +
                  '<div class="box-header">' +
                    '<h3 style="text-align: center">' + name + '</h3>' +
                  '</div>'+
                  '<div class="box-body table-responsive no-padding">'+
                    '<table class="table table-hover" id="table0">'+
                      '<tr>'+
                        '<th>Jam Ke-</th>'+
                        '<th>Rekomendasi</th>'+
                        '<th>Action</th>'+
                       '</tr>'
			+ '';

			var templateBody = '';

			var txStatus;
			var bgStatus;
			var selisih;

			for(var j = 0; data != null && j < data.length; j++){
				
				if(data[j].recomendation == 'pv'){
					bgStatus = 'danger';
					txStatus = 'Panel Surya';
				}
				else if(data[j].recomendation == 'grid'){
					bgStatus = 'info';
					txStatus = 'Grid PLN';
				}
				else{
					bgStatus = 'success';
					txStatus = 'Kombinasi';
				}

				templateBody += ''+
					'<tr>'+
						'<td>' + data[j].jam + '</td>'+
						'<td><span class="label label-'+ bgStatus +'">' + txStatus + '</span></td>'+
						'<td><button class="apply label btn btn-default" id="apply-' + j + '-' + data[j].recomendation + '">Apply</button></td>'+
					'</tr>'
				+'';
			}

			var contain = templateHead + templateBody + templateFoot;
			container.html(contain);	

			$('.apply').click(function(e){
				var id = e.target.id.replace('apply-', '');
				console.log(id);
				applyAppliance(id);
			});
	}

	var applyAppliance = function(value){
		var isSolar = false;
		var isPln = false;
		var idSolar, idPln;

		for(var i = 0; i < dataPower.length; i++){
			if(dataPower[i].nama_switch == 'Grid PLN'){
				isPln = dataPower[i].status_switch;
				idPln = dataPower[i].id;
			}
			else if(dataPower[i].nama_switch == 'Solar Power'){
				isSolar = dataPower[i].status_switch;
				idSolar = dataPower[i].id;
			}
		}

		var isToogle = false;
		var val = value.split('-');

		if(val[1] == 'grid'){
			if(!isPln){
				setApply(idPln);
				isToggle = true;
			}
			if(isSolar) {
				setApply(idSolar);
				isToggle = true;
			}
		}
		else if(val[1] == 'pv'){
			if(isPln){
				setApply(idPln);
				isToggle = true;
			}
			if(!isSolar) {
				setApply(idSolar);
				isToggle = true;
			}
		}
		else{
			if(!isPln){
				setApply(idPln);
				isToggle = true;
			}
			if(!isSolar) {
				setApply(idSolar);
				isToggle = true;
			}
		}

		if(!isToggle){
	      	$.toaster({ priority : 'success', title : 'Message', message : 'Applied!'});
		}


	}

	var setApply = function(id){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/control/switch/power/'+id,
	      timeout: 60000,
	      loading: false,

	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	      	$.toaster({ priority : 'success', title : 'Message', message : 'Success change switch'});
	      }
	      else{
	      	$.toaster({ priority : 'danger', title : 'Message', message : 'Failed change switch'});
	      }

	      getDevice(true);

    	});
		
	}

	var drawTableAppliancesEdit = function(data){
		var container = $('#applianceEdit');
		var name = 'Edit Appliances Switch';

		var templateFoot = ''+
					   '</table>'+
                  	'</div>'+
                  '</div>'+
                '</div>'
                +'';

			var templateHead = '' +
			'<div class="col-xs-12">' +
                '<div class="box">' +
                  '<div class="box-header">' +
                    '<h3 style="text-align: center">' + name + '</h3>' +
                  '</div>'+
                  '<div class="box-body table-responsive no-padding">'+
                    '<table class="table table-hover" id="table0">'+
                      '<tr>'+
                        '<th>No</th>'+
                        '<th>Nama Perangkat</th>'+
                        '<th>Status Switch</th>'+
                        '<th>Daya (watt)</th>'+
                        '<th>Lama Pakai (jam)</th>'+
                        '<th>Action</th>'+
                       '</tr>'
			+ '';

			var templateBody = '';

			for(var j = 0; data != null && j < data.length; j++){
				var switchName = '';
				var daya = 0;
				var durasi = 0;
				var available = 'border: 2px solid red';

				if(data[j].nama_switch){
					switchName = data[j].nama_switch;
					available = '';
				}

				if(data[j].daya){
					daya = data[j].daya;
				}

				if(data[j].lama_pakai){
					durasi = data[j].lama_pakai;
				}

				if(data[j].status_switch){
					var status = 'ON';
					var label = 'success';
				}
				else{
					var status = 'OFF';
					var label = 'danger';
				}

				templateBody += ''+
					'<tr>'+
						'<td>' + (j+1) + '</td>'+
						'<td><input id="editvalueSwitchName-' + data[j].id + '" style="' + available + '"  type="text" class="form-control" value="' + switchName + '" placeholder="(Available Switch)"></td>'+
						'<td><span class="label label-'+ label +'">' + status + '</span></td>'+
						'<td><input id="editvalueDaya-' + data[j].id + '" style="' + available + '"  type="number" class="form-control" value="' + daya + '" placeholder="0"></td>'+
						'<td><input id="editvalueDurasi-' + data[j].id + '" style="' + available + '"  type="number" class="form-control" value="' + durasi + '" placeholder="0"></td>'+
						'<td><button class="edit label btn btn-default" id="edit-' + data[j].id + '">Update</button></td>'+
					'</tr>'
				+'';
			}


			var contain = templateHead + templateBody + templateFoot;
			container.html(contain);	

			$('.edit').click(function(e){
				var id = e.target.id.replace('edit-', '')
				updateAppliance(id)
			});
	}

	var updateAppliance = function(id){
		var nama = $('#editvalueSwitchName-' + id).val().trim();
		var daya = parseFloat($('#editvalueDaya-' + id).val().trim());
		var lama_pakai = parseFloat($('#editvalueDurasi-' + id).val().trim());

		if(nama == ''){
			daya = 0;
			lama_pakai = 0;
		}

		if(daya == '') daya = 0;
		if(lama_pakai == '') lama_pakai = 0;

		var data = {
			id: id,
			nama: nama,
			daya: daya,
			lama_pakai: lama_pakai,
		}
		console.log(data);


		$('#edit-' + id).html('Loading..');
      	$('#edit-' + id).prop("disabled", true);

		service.start({
	      data: data,
	      type: 'post', 
	      uri: App.baseAPI() + '/control/update',
	      timeout: 60000,
	      loading: false,

	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	      	$.toaster({ priority : 'success', title : 'Message', message : 'Success change name'});
	      }
	      else{
	      	$.toaster({ priority : 'danger', title : 'Message', message : 'Failed change name'});
	      }
      
			getDevice(true);

      		$('#edit-' + id).html('Update');
      		$('#edit-' + id).removeAttr('disabled');
    	});
		
	}

	var getSaving = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/saving/' + currentId,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        var costPln = data.fpln.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	        var costSolar = data.fpv.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	        var costSaving = data.fsaving.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

	        $('#costPln').html(costPln);
	        $('#costSolar').html(costSolar);
	        $('#costSaving').html(costSaving);
	      }

    	});
		
	}

	var saveAsses = function(){
		$('#saveAsses').html('Loading..');
      	$("#saveAsses").prop("disabled", true);

		var dataPost = {
			id: currentAsses.id,
			kapasitas_baterai: $('#kapasitasBaterai').val(),
			tegangan_baterai: $('#teganganBaterai').val(),
			kapasitas_solar_panel: $('#kapasitasSolar').val(),
			daya_listrik_rumah: $('#selectDaya').val(),
			lifetime_sistem_pv: $('#lifetimeSolar').val(),
			biaya_investasi: $('#biayaInvestasi').val(),
			lokasi: $('#selectLocation').val(),
		}

		service.start({
	      type: 'post', 
	      uri: App.baseAPI() + '/assesment/edit',
	      timeout: 60000,
	      loading: false,
	      data: dataPost,
	      async: false
	    }, function(){

	      if(service.isSuccessful() && service.status() == 200){
	       	$.toaster({ priority : 'success', title : 'Message', message : 'Data is saved!'});
	       	getAssesment();
	       	getLocation();
	      }
	      else{
	      	$.toaster({ priority : 'danger', title : 'Message', message : 'Failed to save data!'});
			getLocation();
			getDaya();
	      }

      		$('#saveAsses').html('SAVE');
      		$("#saveAsses").removeAttr('disabled');

    	});
		
	}

	var getDaya = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/assesment/va',
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){
	        	var temp = '';
	        	for(var i = 0; i < data.length; i++){
	        		var cell = data[i];
	        		var isSelected = (cell.meteran == currentAsses.daya_listrik_rumah) ? 'selected' : '';
	        		temp += '<option value="' + cell.meteran + '" ' + isSelected + '>' + cell.meteran + '</option>';
	        	}
	        	$('#selectDaya').html(temp);
			}
	      }

    	});
		
	}

	var getLocation = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/assesment/lokasi',
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){
	        	var temp = '';
	        	for(var i = 0; i < data.length; i++){
	        		var cell = data[i];
	        		var isSelected = ''; 
	        		if(cell.city == currentAsses.lokasi) {
	        			isSelected = 'selected';
	        			var currentDate = new Date();
					    var potentionMonth = currentDate.getMonth();
					    var potentionSolar = cell[month[potentionMonth]];
					    
	        		}

	        		temp += '<option value="' + cell.city + '" ' + isSelected + '>' + cell.city + '</option>';
	        	}
	        	$('#selectLocation').html(temp);
	        	$('#potentionSolar').html(potentionSolar);
	        	$('#potentionMonth').html(currentDate.getFullYear() + '/' + (potentionMonth + 1));
			}
	      }

    	});
		
	}

	var getAssesment = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/assesment/view/' + currentId,
	      timeout: 60000,
	      loading: false,
	      async: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        currentAsses = data;
	        $('#kapasitasBaterai').val(currentAsses.kapasitas_baterai);
	        $('#teganganBaterai').val(currentAsses.tegangan_baterai);
	        $('#kapasitasSolar').val(currentAsses.kapasitas_solar_panel);
	        $('#lifetimeSolar').val(currentAsses.lifetime_sistem_pv);
	        $('#biayaInvestasi').val(currentAsses.biaya_investasi);
	      }

    	});
		
	}
	
	var getDataPower = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/watt',
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){
	        	for(var i = 0; i < data.length; i++){
	        		var cell = data[i];
	        		if(cell.tipe_energy == 'battery'){

	        			gaugeGridPower.set(cell.watt);
	        			$('#plnStat').html(cell.watt.toFixed(2));

						$('#vPln').html(parseFloat(cell.v).toFixed(2) + ' V');
						$('#iPln').html(parseFloat(cell.i).toFixed(2) + ' A');
	        		}
	        		else if(data[i].tipe_energy == 'pln'){
						
	        			gaugeSolarPower.set(cell.watt);
	        			$('#solarStat').html(cell.watt.toFixed(2));

						$('#vSolar').html(parseFloat(cell.v).toFixed(2) + ' V');
						$('#iSolar').html(parseFloat(cell.i).toFixed(2) + ' A');
	        		}
	        	}
			}
	      }

    	});
		
	}


	var getCountDevice = function(){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/control/count/' + currentId,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        var countSwitchOn = 0;
			var countSwitchOff = 0;
	        if(data != null && data.length > 0){
	        	for(var i = 0; i < data.length; i++){
	        		var cell = data[i];
	        		if(cell.status_switch == 0){
						countSwitchOff = cell.jumlah;
	        		}
	        		else{
						countSwitchOn = cell.jumlah;
	        		}

					$('#countSwitchOff').html(countSwitchOff);
					$('#countSwitchOn').html(countSwitchOn);
	        	}
			}
	      }

    	});
		
	}

	var dataPower;
	var getDevice = function(isView = false){
		

		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/control/view/' + currentId + '/all',
	      timeout: 60000,
	      loading: false
	    }, function(){
	    	

	      if(service.isSuccessful()){
	      	var data = service.response();

	      	if(isView){
	      		if(data != null && data.appliance.length > 0){
		        	drawTableAppliancesEdit(data.appliance);
				}
				if(data != null && data.power.length > 0){
		        	dataPower = data.power;
				}
	      	}
	      	else{
		        if(data != null && data.appliance.length > 0){
		        	drawApplicances(data.appliance);
				}

				if(data != null && data.power.length > 0){
		        	drawPower(data.power);
				}
			}
	      }

    	});
		
	}


	var getHistory = function(jenis){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/mesin/' + jenis,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){    	
				drawTableHistory(data, jenis + 'History');
			}
			else{
				drawTableHistory(null, jenis + 'History');
			}
	      }

    	});
		
	}

	var getLoadPower = function(stat = 'day'){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/kwh/' + stat,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){

	        	setGraphCompare(data, stat);
			}
	      }

    	});
		
	}

	
	var graphCompare;	
	var drawGraphCompare = function(){
	    var lineChartData = {
	      labels  : [],
	      datasets: [
	        {
	          label               : 'Grid PLN',
	          backgroundColor 	  : '#ff3200',
              borderColor         : '#ff3200',
              data                : [] //point
	        },
	        {
	          label               : 'Photovoltaic',
	          backgroundColor 	  : '#ffdf7a',
              borderColor         : '#ffdf7a',
              data                : []
	        },
	        {
	          label               : 'Load',
	          backgroundColor 	  : '#846400',
              borderColor         : '#846400',
              data                : []
	        }
	      ]
	    };

	    var lineChartOptions = {
	    	responsive: true,
        	animation: false,

	      scales: {
		    yAxes: [{
		      scaleLabel: {
		        display: true,
		        labelString: 'Daya (kWh)'
		      },
		      ticks: {
                min: 0,
                /*callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                }*/
              }
		    }],
		    xAxes: [{
		      scaleLabel: {
		        display: true,
		        labelString: 'Date / Time'
		      }
		    }]
		  },

		  tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
	    };

	    //-------------
	    //- LINE CHART -
	    //--------------
		var lineChartCanvas          = $('#lineChart').get(0).getContext('2d');
		graphCompare = new Chart(lineChartCanvas, {
		    type: 'bar',
		    data: lineChartData,
		    options: lineChartOptions
		});
	}

	var updateGraphCompare = function(stat, label = [], value = []){
	
		var xAxes = '';
		if(stat == 'day'){
			xAxes = 'Hour';
		}
		else if(stat == 'week'){
			xAxes = 'Day';
		}
		else if(stat == 'month'){
			xAxes = 'Day';
		}
		else if(stat == 'year'){
			xAxes = 'Month';
		}

		graphCompare.data.labels = label;
		graphCompare.options.scales.xAxes[0].scaleLabel.labelString = xAxes;
		for(var i=0; i<value.length; i++){
			graphCompare.data.datasets[i].data = value[i];
		}
		graphCompare.update();
	}

	var setGraphCompare = function(data, stat){
		if(data == null) return;

		var totalSolarKwh = 0;
		var totalPlnKwh = 0;
		var totalLoadKwh = 0;

		var point = {
			load: [],
			battery: [],
			pln:[]
		};
		var label = {
			load: [],
			battery: [],
			pln:[]
		};
		var finalLabel = [];
		
		var log;
		for(var i = 0; i < data.length; i++){
			var cell = data[i];

			if(stat == 'day'){
				log = "Day " + cell.day + ' (' + cell.year + '/' + cell.month + ')';
			}
			else if(stat == 'week'){
				log = "Week " + cell.week + ' (' + cell.year + '/' + cell.month + ')';
			}
			else if(stat == 'month'){
				log = "Month " + cell.month + ' (' + cell.year + ')';
			}
			else if(stat == 'year'){
				log = "Year " + cell.year;
			}

			if(cell.tipe_energy == 'battery'){
				totalSolarKwh += cell.kwh;

				point.battery.push(cell.kwh.toFixed(2));
				if(stat == 'day'){
					label.battery.push(cell.hour);
				}
				else if(stat == 'week'){
					label.battery.push(cell.day);
				}
				else if(stat == 'month'){
					label.battery.push(cell.day);
				}
				else if(stat == 'year'){
					label.battery.push(cell.month);
				}
			}
			else if(cell.tipe_energy == 'pln'){
				totalPlnKwh += cell.kwh;

				point.pln.push(cell.kwh.toFixed(2));
				if(stat == 'day'){
					label.pln.push(cell.hour);
				}
				else if(stat == 'week'){
					label.pln.push(cell.day);
				}
				else if(stat == 'month'){
					label.pln.push(cell.day);
				}
				else if(stat == 'year'){
					label.pln.push(cell.month);
				}
			}

			else if(cell.tipe_energy == 'load'){
				totalLoadKwh += cell.kwh;

				point.load.push(cell.kwh.toFixed(2));
				if(stat == 'day'){
					label.load.push(cell.hour);
				}
				else if(stat == 'week'){
					label.load.push(cell.day);
				}
				else if(stat == 'month'){
					label.load.push(cell.day);
				}
				else if(stat == 'year'){
					label.load.push(cell.month);
				}
			}
		}

		if(label.load.length >= label.pln.length){
			finalLabel = label.load;
		}
		else if(label.pln.length > label.battery.length){
			finalLabel = label.pln;	
		}
		else if(label.battery.length > label.load.length){
			finalLabel = label.battery;
		}

		updateGraphCompare(stat, finalLabel, [
			point.pln,
			point.battery,
			point.load
		]);

		$('#log').html(log);
		$('#totalSolarKwh').html(totalSolarKwh.toFixed(2));
		$('#totalPlnKwh').html(totalPlnKwh.toFixed(2));

	}


	var gaugeSolarPower; 
	var drawGraphSolarPower = function(currentValue = 0, maxValue = 1000){
		//$('#solarStat').html(currentValue);
		
		var opts = {
		  angle: 0.3, // The span of the gauge arc
		  lineWidth: 0.1, // The line thickness
		  radiusScale: 1, // Relative radius
		  pointer: {
		    length: 0.6, // // Relative to gauge radius
		    strokeWidth: 0.035, // The thickness
		    color: '#000000' // Fill color
		  },
		  limitMax: false,     // If false, max value increases automatically if value > maxValue
		  limitMin: false,     // If true, the min value of the gauge will be fixed
		  colorStart: '#eee',   // Colors
		  colorStop: '#eee',    // just experiment with them
		  strokeColor: '#006eff',  // to see which ones work best for you
		  generateGradient: true,
		  highDpiSupport: true,     // High resolution support
		  
		};

		var target = document.getElementById('solarPowerGauge'); // your canvas element
		//target.removeAttribute("style");
		gaugeSolarPower = new Donut(target).setOptions(opts); // create sexy gauge!
		gaugeSolarPower.maxValue = maxValue; // set max gauge value
		gaugeSolarPower.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		gaugeSolarPower.animationSpeed = 32; // set animation speed (32 is default value)
		//gaugeSolarPower.set(currentValue); // set actual value
	}

	var gaugeGridPower; 
	var drawGraphGridPower = function(currentValue = 0, maxValue = 1000){
		//$('#plnStat').html(currentValue);

		var opts = {
		  angle: 0.3, // The span of the gauge arc
		  lineWidth: 0.1, // The line thickness
		  radiusScale: 1, // Relative radius
		  pointer: {
		    length: 0.6, // // Relative to gauge radius
		    strokeWidth: 0.035, // The thickness
		    color: '#000000' // Fill color
		  },
		  limitMax: false,     // If false, max value increases automatically if value > maxValue
		  limitMin: false,     // If true, the min value of the gauge will be fixed
		  colorStart: '#eee',   // Colors
		  colorStop: '#eee',    // just experiment with them
		  strokeColor: '#006eff',  // to see which ones work best for you
		  generateGradient: true,
		  highDpiSupport: true,     // High resolution support
		};

		var target = document.getElementById('gridPowerGauge'); // your canvas element
		//target.removeAttribute("style");
		gaugeGridPower = new Donut(target).setOptions(opts); // create sexy gauge!
		gaugeGridPower.maxValue = maxValue; // set max gauge value
		gaugeGridPower.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		gaugeGridPower.animationSpeed = 32; // set animation speed (32 is default value)
		gaugeGridPower.set(currentValue); // set actual value
	}

	var drawTableHistory = function(data, tableName){
		var container = $('#' + tableName);
		var name = 'Battery History';
		if(tableName == 'plnHistory'){
			name = 'Grid PLN History';
		}


		var templateFoot = ''+
					   '</table>'+
                  	'</div>'+
                  '</div>'+
                '</div>'
                +'';
			var templateHead = '' +
			'<div class="col-xs-12">' +
                '<div class="box">' +
                  '<div class="box-header">' +
                    '<h3 style="text-align: center">' + name + '</h3>' +
                  '</div>'+
                  '<div class="box-body table-responsive no-padding">'+
                    '<table class="table table-hover" id="table0">'+
                      '<tr>'+
                        '<th rowspan="2" style="text-align:center">No</th>'+
                        '<th colspan="3" style="text-align:center">Awal</th>'+
                        '<th colspan="3" style="text-align:center">Akhir</th>'+
                        '<th rowspan="2" style="text-align:center">Durasi</th>'+
                       '</tr>' +
                       '<tr>'+
                        '<th></th>'+
                        '<th>Date</th>'+
                        '<th>Time</th>'+
                        '<th></th>'+
                        '<th>Date</th>'+
                        '<th>Time</th>'+
                       '</tr>'
			+ '';

			var templateBody = '';

			var txStatusAwal, txStatusAkhir;
			var bgStatusAwal, bgStatusAkhir;
			var selisih;

			for(var j = 0; data != null && j < data.length; j++){

				if(data[j].status_awal == 0){
					bgStatusAwal = 'danger';
					txStatusAwal = 'off';
				}
				else if(data[j].status_awal == 1){
					bgStatusAwal = 'success';
					txStatusAwal = 'on';
				}
				if(data[j].status_akhir == 0){
					bgStatusAkhir = 'danger';
					txStatusAkhir = 'off';
				}
				else if(data[j].status_akhir == 1){
					bgStatusAkhir = 'success';
					txStatusAkhir = 'on';
				}

				selisih = data[j].diff 

				templateBody += ''+
					'<tr>'+
						'<td>' + (j+1) + '</td>'+
						'<td><span class="label label-'+ bgStatusAwal +'">' + txStatusAwal + '</span></td>'+
						'<td>' + data[j].date_awal + '</td>'+
						'<td>' + data[j].time_awal + '</td>'+
						'<td><span class="label label-'+ bgStatusAkhir +'">' + txStatusAkhir + '</span></td>'+
						'<td>' + data[j].date_akhir + '</td>'+
						'<td>' + data[j].time_akhir + '</td>'+
						'<td>' + selisih + '</td>'+
					'</tr>'
				+'';
			}

			var contain = templateHead + templateBody + templateFoot;
			container.html(contain)

		
	}

	var drawApplicances = function(data){
		if(data == null) return;

		var container = $('#appMon');
		
		var template = '';
		for(var j = 0; j < data.length; j++){
			var cell = data[j];

			var status, color;
			if(cell.status_switch == 0){
				status = 'fa-toggle-off';
				color = '#e5002d';
			}

			else{
				status = 'fa-toggle-on';
				color = 'green';
			}

			var deviceName = (cell.nama_switch) ? cell.nama_switch : '(Available Switch)';


			template += '' + 
				'<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">' +
		            '<div class="small-box" style="background-color: white;">' +
		              '<div class="row" style="padding: 25px">' +
		                  '<div class="inner">' +
		                    '<span class="fa fa-angle-right" style="color: #00c3d8; font-size: 30px; float: right; margin-right: 10px"></span>' +
		                    '<h3 style="color: black; text-align: center; font-size: 18px">' + deviceName + '</h3>' +
		                    
		                    '<div style="text-align: center;">' +
		                        '<span class="appliance fa ' + status + '" style="color: ' + color + '; font-size: 50px;" id="appliance-' + cell.id + '"></span>' +
		                    '</div>' +
		                  '</div>' +
		                '</div>' +
		              '</div>' +
		          '</div>' +
		          '';
		}
		container.html(template);
		
		$('.appliance').click(function(e){
			var id = e.target.id.replace('appliance-', '')
			setToggleDevice('appliance', id)
		});
	}

	var drawPower = function(data){
		if(data == null) return;
		
		for(var j = 0; j < data.length; j++){
			var cell = data[j];

			var status, color;
			if(cell.status_switch == 0){
				status = 'fa-toggle-off';
				color = '#e5002d';
			}

			else{
				status = 'fa-toggle-on';
				color = 'green';
			}

			if(cell.nama_switch == 'Grid PLN'){
				$('#plnPower').html('<span class="power fa ' + status + '" style="color: ' + color + '; font-size: 50px;" id="power-' + cell.id + '"></span>');
			}
			else if(cell.nama_switch == 'Solar Power'){
				$('#solarPower').html('<span class="power fa ' + status + '" style="color: ' + color + '; font-size: 50px;" id="power-' + cell.id + '"></span>');
			}
		}
		
		$('.power').click(function(e){
			var id = e.target.id.replace('power-', '');
			setToggleDevice('power', id)
		});
	}

	var setToggleDevice = function(uri, id){
		isToggle = true;
		$('#' + uri + '-' + id).replaceWith('<p style="color:black; font-size: 28px">switching..</p>');

		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/control/switch/' + uri + '/' + id,
	      timeout: 60000,
	      loading: false,

	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	      	$.toaster({ priority : 'success', title : 'Message', message : 'Success change switch'});
	      }
	      else{
	      	$.toaster({ priority : 'danger', title : 'Message', message : 'Failed change switch'});
	      }

	      getCountDevice();
	      getDevice();
	      isToggle = false;

    	});
		
	}

	var getLoadEmission = function(stat = 'day'){
		service.start({
	      type: 'get', 
	      uri: App.baseAPI() + '/data/emission/' + stat + '/' + currentId,
	      timeout: 60000,
	      loading: false
	    }, function(){

	      if(service.isSuccessful()){
	        var data = service.response();
	        if(data != null && data.length > 0){

	        	setGraphEmission(data, stat);
			}
	      }

    	});
		
	}


	var graphEmission;	
	var drawGraphEmission = function(){
	    var lineChartData = {
	      labels  : [],
	      datasets: [
	        {
	          label               : 'Emission\'s Battery',
	          backgroundColor 	  : '#ff3200',
              borderColor         : '#ff3200',
              data                : [] //point
	        },
	        
	      ]
	    };

	    var lineChartOptions = {
	    	responsive: true,
        	animation: false,

	      scales: {
		    yAxes: [{
		      scaleLabel: {
		        display: true,
		        labelString: 'Karbon (kg)'
		      },
		      ticks: {
                min: 0,
                /*callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                }*/
              }
		    }],
		    xAxes: [{
		      scaleLabel: {
		        display: true,
		        labelString: 'Date / Time'
		      }
		    }]
		  },

		  tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
	    };

	    //-------------
	    //- LINE CHART -
	    //--------------
		var lineChartCanvas          = $('#lineChartEmission').get(0).getContext('2d');
		graphEmission = new Chart(lineChartCanvas, {
		    type: 'bar',
		    data: lineChartData,
		    options: lineChartOptions
		});
	}

	var updateGraphEmission = function(stat, label = [], value = []){
	
		var xAxes = '';
		if(stat == 'day'){
			xAxes = 'Hour';
		}
		else if(stat == 'week'){
			xAxes = 'Day';
		}
		else if(stat == 'month'){
			xAxes = 'Day';
		}
		else if(stat == 'year'){
			xAxes = 'Month';
		}

		graphEmission.data.labels = label;
		graphEmission.options.scales.xAxes[0].scaleLabel.labelString = xAxes;
		for(var i=0; i<value.length; i++){
			graphEmission.data.datasets[i].data = value[i];
		}
		graphEmission.update();
	}

	var setGraphEmission = function(data, stat){
		if(data == null) return;

		var point = {
			battery: []
		};
		var label = {
			battery: []
		};
		var finalLabel = [];
		
		var log;
		for(var i = 0; i < data.length; i++){
			var cell = data[i];

			if(stat == 'day'){
				log = "Day " + cell.day + ' (' + cell.year + '/' + cell.month + ')';
			}
			else if(stat == 'week'){
				log = "Week " + cell.week + ' (' + cell.year + '/' + cell.month + ')';
			}
			else if(stat == 'month'){
				log = "Month " + cell.month + ' (' + cell.year + ')';
			}
			else if(stat == 'year'){
				log = "Year " + cell.year;
			}

			if(cell.tipe_energy == 'battery'){
				totalSolarKwh += cell.kwh;

				point.battery.push(cell.kwh.toFixed(2));
				if(stat == 'day'){
					label.battery.push(cell.hour);
				}
				else if(stat == 'week'){
					label.battery.push(cell.day);
				}
				else if(stat == 'month'){
					label.battery.push(cell.day);
				}
				else if(stat == 'year'){
					label.battery.push(cell.month);
				}
			}
			
		}

		
		finalLabel = label.battery;

		updateGraphEmission(stat, finalLabel, [
			point.battery
		]);

		$('#logEmission').html(log);

	}

	
}