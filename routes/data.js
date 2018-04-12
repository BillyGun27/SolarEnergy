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

router.post('/err', function(request, response, next) {
     
    
  response.send(request.headers);   

});

/* GET home page. */
router.get('/sensor', function(request, response, next) {
  // callback
  var result;//request.body.min//request.query.min 
  //console.log("l"+(request.query.min == null )  );
  var min = moment(request.query.min,"MM/DD/YY" ).format("YYYY-MM-DD");
  var max =  moment(request.query.max,"MM/DD/YY" ).format("YYYY-MM-DD");
 // console.log(max);
  var query = {
    text: "SELECT id,do_value, to_char(receive_date, 'MM/DD/YY') AS receive_date,receive_time FROM sensor WHERE receive_date BETWEEN $1 AND $2 ",
    values: [ min , max ]
  }
pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
  // console.log(res)
 }
 response.send(result); 
 //console.log(request);  
});



});

/* GET home page. */
router.get('/watt/:tipe', function(request, response, next) {
  // callback
  var result;//request.body.min//request.query.min 

  var query = {
    name: request.params.tipe ,
    text: "SELECT id,tipe_energy , v::float*i::float AS watt, to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time FROM energy WHERE tipe_energy = $1 ORDER BY id DESC LIMIT 1",
    values: [request.params.tipe]
  }
pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
  // console.log(res)
 }
 response.send(result); 
 //console.log(request);  
});



});

/*
router.get('/sensor', function(request, response, next) {
  // callback
  var result;//request.body.min//request.query.min 
  //console.log("l"+(request.query.min == null )  );
  
  var query = {
    text: "SELECT id,do_value, to_char(receive_date, 'MM/DD/YY') AS receive_date,receive_time FROM sensor  "
  }
pool.query(query, (err, res) => {
 if (err) {
     result = err.stack;
   console.log(err.stack)
 } else {
     result=res.rows;//.rows[0];
  // console.log(res)
 }
 response.send(result); 
 //console.log(request);  
})

});
*/
/**
 * SELECT x1.id, x1.date, DATEDIFF(mi, x2.date, x1.date)
FROM x AS x1 LEFT JOIN x AS x2
ON x1.id = x2.id +1 
 */

/* GET home page. */
router.get('/mesin/:tipe', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    name: request.params.tipe ,
    text: "SELECT x1.status_mesin AS status_awal,x1.receive_time AS time_awal ,to_char(x1.receive_date, 'MM/DD/YY') AS date_awal, x2.status_mesin AS status_akhir,x2.receive_time AS time_akhir  ,to_char(x2.receive_date, 'MM/DD/YY') AS date_akhir, to_char((y2-y1),'DDD HH24:MI:SS') AS diff FROM public.mesin AS x1 ,public.mesin AS x2 ,to_timestamp(x1.receive_date||' '||x1.receive_time,'YYYY/FMMM/FMDD FMHH24:FMMI:FMSS' ) AS y1,to_timestamp(x2.receive_date||' '||x2.receive_time,'YYYY/FMMM/FMDD FMHH24:FMMI:FMSS' ) AS y2 WHERE x1.id +1 = x2.id  AND x1.tipe_mesin=$1 AND x2.tipe_mesin=$1 ",
    values: [request.params.tipe]
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

router.get('/pompa', function(request, response, next) {
  // callback
  var result;
  var query = {
    text: "SELECT * from mesin  ORDER BY id DESC LIMIT 1"//,
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


router.get('/mesinall', function(request, response, next) {
  // callback
  var result;
  var query = {
    text: "SELECT * from mesin "//,
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