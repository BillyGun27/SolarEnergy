var Session = function(){
	var storage = "session";

	this.set = function(name, value = null){
		var data = {};
		try{
	       	data = JSON.parse(localStorage[storage]);
	     
	    } catch(e){}

	    data[name] = value;
	    localStorage.setItem(storage, JSON.stringify(data));
	
	}

	this.get = function(name = null){
		try{
	       	var data = JSON.parse(localStorage[storage]);

	       	if(name == null){
				return data;
			}
	       	return data[name];

	    } catch(e){
	    	return null;
	    }
	}

	this.destroy = function(){
		localStorage.removeItem(storage);
	}
}