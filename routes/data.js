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
router.get('/kwh/:timepart/:detail?', function(request, response, next) {
  if(request.params.detail == undefined){
    if(request.params.timepart == "current"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY day,month,year,receive_date ORDER BY receive_date DESC LIMIT 1";
    }else if(request.params.timepart == "day"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  WHERE date_part('day', receive_date::date )= (SELECT date_part('day', receive_date::date )AS day FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY hour,day,month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "week"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy WHERE date_part('week', receive_date::date ) = (SELECT date_part('week', receive_date::date )AS week FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY week,month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "month"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy WHERE date_part('month', receive_date::date ) = (SELECT date_part('month', receive_date::date ) AS month FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "year"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year  FROM energy WHERE date_part('year', receive_date::date ) = (SELECT date_part('year', receive_date::date )  AS year FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY month,year ORDER BY month DESC"
    }
  }else{
    if(request.params.timepart == "current"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY day,month,year,receive_date ORDER BY receive_date DESC LIMIT 1";
    }else if(request.params.timepart == "day"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  GROUP BY hour,day,month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "week"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  GROUP BY week,month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "month"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY month,year,receive_date ORDER BY receive_date DESC ";
    }else if(request.params.timepart == "year"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year  FROM energy GROUP BY month,year ORDER BY month DESC"
    }
  }
 
  //"SELECT id,do_value, to_char(receive_date, 'MM/DD/YY') AS receive_date,receive_time FROM sensor WHERE receive_date BETWEEN $1 AND $2 "
  // callback
  var result;//request.body.min//request.query.min 

  var query = {
    text: output,
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
    name: "watt" ,
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

/* GET home page. */
router.get('/mesin/:tipe', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    name: "mesin" ,
    text: "SELECT x1.tipe_mesin ,x1.status_mesin AS status_awal,x1.receive_time AS time_awal ,to_char(x1.receive_date, 'MM/DD/YY') AS date_awal, x2.status_mesin AS status_akhir,x2.receive_time AS time_akhir  ,to_char(x2.receive_date, 'MM/DD/YY') AS date_akhir, to_char((y2-y1),'DDD HH24:MI:SS') AS diff FROM public.mesin AS x1 ,public.mesin AS x2 ,to_timestamp(x1.receive_date||' '||x1.receive_time,'YYYY/FMMM/FMDD FMHH24:FMMI:FMSS' ) AS y1,to_timestamp(x2.receive_date||' '||x2.receive_time,'YYYY/FMMM/FMDD FMHH24:FMMI:FMSS' ) AS y2 WHERE x1.id +1 = x2.id  AND x1.tipe_mesin=$1 AND x2.tipe_mesin=$1 ",
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




module.exports = router;