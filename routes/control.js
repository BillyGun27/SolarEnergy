var express = require('express');
const path = require('path');
var mv = require('mv');
var moment = require('moment-timezone');

var router = express.Router();
var pool = require("../connectpg");

var fs = require('fs');
const formidable = require('express-formidable');

/* GET home page. */
router.get('/', function(request, response, next) {
     
    
    response.send(request.headers);   

});

//user based
router.post('/insert', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "INSERT INTO public.switch(nama_switch, status_switch) VALUES ( $1 , '0'); ",
    values: [request.body.nama]
  }
pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});

router.post('/update', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "UPDATE switch SET nama_switch = $2 WHERE id=$1;",
    values: [request.body.id,request.body.nama]
  }
pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result="success";//res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});


router.get('/switch/:type/:id', function(request, response, next) {
  // callback//req.params
  var result;
  if(request.params.type == 'power'){
    var query = {
      text: "UPDATE main_switch SET status_switch = CASE WHEN status_switch = 0 then 1 WHEN status_switch = 1 then 0 ELSE 0 END WHERE id=$1;",
      values: [request.params.id]
    }
  }else if(request.params.type == 'appliance'){
    var query = {
      text: "UPDATE switch SET status_switch = CASE WHEN status_switch = 0 then 1 WHEN status_switch = 1 then 0 ELSE 0 END WHERE id=$1;",
      values: [request.params.id]
    }
  }
 
pool.query(query, (err, res) => {
 if (err) {
     result ="error";// err.stack;
   console.log(err.stack)
 } else {
     result="success";//res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});

//user based
router.get('/view/:id_user/all', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT id, nama_switch, status_switch FROM switch WHERE id_user = $1 ORDER BY id ASC ;",
    values: [request.params.id_user]
  }
pool.query(query, (err, res) => {
 if (err) {
     appliance = err.stack;
   console.log(err.stack)
 } else {
     appliance =res.rows;//.rows[0];
   console.log(res)
 }

        var query = {
          text: "SELECT id, nama_switch, status_switch FROM main_switch WHERE id_user = $1 ORDER BY id ASC;",
          values: [request.params.id_user]
        }
        pool.query(query, (err, res) => {
        if (err) {
          power = err.stack;
        console.log(err.stack)
        } else {
          power =res.rows;//.rows[0];
        console.log(res)
        }

          result = {power:power , appliance:appliance};
        response.send(result);   
        })
  
 // response.send(result);   
})

});

router.get('/view/:id', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT * FROM switch WHERE id = $1 ;",
    values: [request.params.id]
  }

pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});

router.get('/count/:id_user', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT  status_switch, COUNT(status_switch) AS jumlah FROM public.switch WHERE id_user = $1 GROUP BY status_switch ;",
    values: [request.params.id_user]
  }

pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});

router.get('/total/:id_user', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT id_user, COUNT(id_user) AS jumlah FROM public.switch WHERE id_user = $1 GROUP BY id_user ;",
    values: [request.params.id_user]
  }

pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
   console.log(res)
 }
 response.send(result);   
})

});



module.exports = router;