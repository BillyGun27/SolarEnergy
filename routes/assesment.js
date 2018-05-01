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

router.post('/edit', function(request, response, next) {
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

/* Energy Assesment */
router.get('/lokasi', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    name: "lokasi" ,
    text: "SELECT * FROM solar_irradiances",
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

/* Energy Assessment */
router.get('/va', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    name: "va" ,
    text: "SELECT no, meteran FROM meteran_pln",
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