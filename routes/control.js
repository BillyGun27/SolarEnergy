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

router.get('/switch/:id', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "UPDATE switch SET status_switch = CASE WHEN status_switch = 0 then 1 WHEN status_switch = 1 then 0 ELSE 0 END WHERE id=$1;",
    values: [request.params.id]
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

router.get('/view/all', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT id, nama_switch, status_switch,priority FROM public.main_switch  UNION SELECT id, nama_switch, status_switch,priority FROM public.switch ORDER BY priority,id "
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

router.get('/count', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT status_switch, COUNT(status_switch) AS jumlah FROM public.switch GROUP BY status_switch ;"
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