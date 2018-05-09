var express = require('express');
var router = express.Router();
var jwt = require('json-web-token');
var passwordHash = require('password-hash');
var secret = 'NotSecret';
var pool = require("../connectpg");


/* GET home page. */
router.get('/', function(request, response, next) {
  response.send("hello");
});

function InsertMainSwitch(){
  var query = {
    // give the query a unique name
   // name: 'get_sensor',
    text: "INSERT INTO main_switch(user_id, nama_switch, status_switch) VALUES ( (SELECT id FROM public.user_account ORDER BY id DESC LIMIT 1), 'Solar Power', '0');"
          +"INSERT INTO main_switch( user_id, nama_switch, status_switch) VALUES ( (SELECT id FROM public.user_account ORDER BY id DESC LIMIT 1), 'Grid PLN', '0');",
  }

  pool.query(query, (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {
          if(res.rowCount){
              result=true;//.rows[0];
          }else{
              result = false;
          }
          
        //console.log(res)
      }
    });
    
}

router.post('/register', function(request, response, next) {
  var hashedPassword = passwordHash.generate(request.body.password);
  var query = {
    // give the query a unique name
   // name: 'get_sensor',
    text: 'INSERT INTO user_account (email,password) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    values: [request.body.email, hashedPassword]
  }

  pool.query(query, (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {
          if(res.rowCount){
              result=true;//.rows[0];

              InsertMainSwitch();
          }else{
              result = false;
          }
          
        //console.log(res)
      }
      response.send(result);   
    });

});

var out;
router.post('/login', function(request, response, next) {
    var query = {
        // give the query a unique name
       // name: 'get_sensor',
        text: 'SELECT * FROM user_account WHERE email=$1',
        values: [request.body.email]
      }

      result = "none";
    pool.query(query, (err, res) => {
        if (err) {
            result = err.stack;
          console.log(err.stack)
        } else {
            if(res.rowCount){
            //  result = res;//.rows.password;
            out = res.rows;
            console.log(res.rows);
            console.log(res.rows[0].email);
            console.log(res.rows[0].password);
             if(passwordHash.verify(request.body.password, res.rows[0].password)){
               
                 //.rows[0];

                 var payload = {
                   "code": "solar",
                  "id" : res.rows[0].id,
                  "email": res.rows[0].email
                };
                 
                
              
                // encode 
              jwt.encode(secret, payload, function (err, token) {
                if (err) {
                  console.error(err.name, err.message);
                  result=err.name, err.message;
                } else {
                  console.log(token);
               
                  result=token;
                 
                }
              });

              // decode 
 jwt.decode(secret, result, function (err_, decodedPayload, decodedHeader) {
    if (err) {
      console.error(err.name, err.message);
    } else {
      console.log(decodedPayload, decodedHeader);
    }
  });
              var obj = {token:result, email:request.body.email , res:out};

              }else{
                console.log("password false");
                result="password false"; 

              var obj = {status:result};
                
              }
               

            }else{
              console.log("email false");
              result="email false"; 

              var obj = {status:result};
            }
          //console.log(res)
        }

        //response.send(result);
        //  if(result){
         //   response.redirect('/home')
       //   }else{
           
            response.send(JSON.stringify(obj));
         // }
        //response.end();
      });

  });


module.exports = router;