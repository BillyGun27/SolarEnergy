var Request = function(){
	var data;
	var is_valid = true;

	this.input = function(string = null){
		data = string;
		return this;
	}

	this.makeValid = function(filter){
		/* email|url|required */
        
        if(is_valid){
            var error = false;

            var validation = filter.split('|');

            for(var i = 0; i < validation.length; i++){
                switch (validation[i]) {
                    case 'required':
                        error = isEmpty(data);
                        break;
                    case 'email':
                        error = !isMail(data);
                        break;
                    default:
                        //# code...
                        break;
                }
                
                if(error){
                    is_valid = false;
                    break;
                }
            }

        }

        return this;
	}

	this.save = function(){
		return data;
	}

	this.isValid = function(){
		return is_valid;
	}

	var isMail = function(string){
	    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	    return re.test(string);
	}

	var isEmpty = function(string){
	   	return (!string || 0 === string.length);
	}


}