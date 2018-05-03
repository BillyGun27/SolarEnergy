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

var ind = moment().tz("Asia/Jakarta")
router.post('/insert', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: 'INSERT INTO energy (v,i ,receive_date,receive_time,tipe_energy) VALUES ($1,$2,$3,$4,$5) ',
      values: [ request.body.v, request.body.i  ,ind.format('MM/DD/YY'),ind.format('HH:mm:ss') , request.body.type ]//heroku
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


/* GET home page. */
router.get('/kwh/:timepart/:detail?', function(request, response, next) {
  if(request.params.detail == undefined){//recent data only
    if(request.params.timepart == "current"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY day,month,year,receive_date,tipe_energy ORDER BY receive_date DESC LIMIT 3 ";
    }else if(request.params.timepart == "day"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  WHERE date_part('day', receive_date::date )= (SELECT date_part('day', receive_date::date )AS day FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY hour,day,month,year,receive_date,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "week"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy WHERE date_part('week', receive_date::date ) = (SELECT date_part('week', receive_date::date )AS week FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY week,month,year,receive_date,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "month"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy WHERE date_part('month', receive_date::date ) = (SELECT date_part('month', receive_date::date ) AS month FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY month,year,receive_date,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "year"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year  FROM energy WHERE date_part('year', receive_date::date ) = (SELECT date_part('year', receive_date::date )  AS year FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY month,year,tipe_energy ORDER BY month ASC"
    }
  }else{//detail = all
    if(request.params.timepart == "current"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY day,month,year,receive_date ,tipe_energy ORDER BY receive_date DESC LIMIT 3";
    }else if(request.params.timepart == "day"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  GROUP BY hour,day,month,year,receive_date,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "week"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  GROUP BY week,month,year,receive_date,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "month"){
      output = "SELECT tipe_energy ,SUM( v::float*i::float)/1000 AS kwh,receive_date ,date_part('day', receive_date::date )AS day, date_part('week', receive_date::date )AS week ,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy GROUP BY month,year,receive_date ,tipe_energy ORDER BY receive_date ASC ";
    }else if(request.params.timepart == "year"){
      output = "SELECT SUM( v::float*i::float)/1000 AS kwh,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year  FROM energy GROUP BY month,year,tipe_energy ORDER BY month DESC"
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
router.get('/watt/:tipe?', function(request, response, next) {
  // callback
  var result;//request.body.min//request.query.min 

  if(request.params.tipe == undefined){
    var query = {
      text: "SELECT DISTINCT ON(tipe_energy) id,tipe_energy , v::float*i::float AS watt, v,i, to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time  FROM energy ORDER BY tipe_energy ,receive_date DESC,receive_time DESC",
      //values: [request.params.tipe]
    }
  }else{
    var query = {//pln, battery , load
      text: "SELECT id,tipe_energy , v::float*i::float AS watt,v,i, to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time FROM energy WHERE tipe_energy = $1 ORDER BY tipe_energy ,receive_date DESC ,receive_time DESC LIMIT 1",     
      values: [request.params.tipe]
    }
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

router.post('/upload', formidable(), function(request, response, next) {
  // callback
console.log(JSON.stringify(request.files) );
var file = request.files.thumbnail;
//var ext = str.split(".");
oldpath = file.path;
newpath = path.join( __dirname  ,'../xls/'+ "sample_data.xls");
mv(oldpath, newpath, function(err) {
  // done. it tried fs.rename first, and then falls back to
  // piping the source file to the dest file and then unlinking
  // the source file.
});
response.send(newpath);
 // response.redirect('/home');
});

var node_xj = require("xlsx-to-json-lc");
var jsonQuery = require('json-query');

router.get('/xls', function(request, response, next) {
  // callback
  var data;
  
  node_xj({
    input: path.join( __dirname  ,'../xls/'+ "sample_data.xls"),  // input xls 
    output: null, // output json 
    lowerCaseHeaders:true
  }, function(err, result) {
    if(err) {
      data = err;
      console.error(err);
    } else {
      data = result;
      console.log(result);
    }
    /**
     * var data = {
  people: [
    {name: 'Matt', country: 'NZ'},
    {name: 'Pete', country: 'AU'},
    {name: 'Mikey', country: 'NZ'}
  ]
}
   */  
//"date":"12/21/17"dat =
//datmin = request.query.min;//request.body.min; 
//datmax = request.query.max;//request.body.max;
   // var output= jsonQuery('[* date>='+datmin+' & date<='+datmax+']', {
   //   data: data
   // }).value

   // response.send(output); 
   response.send(data); 
  });
 
});

/* GET home page. */
router.get('/batcap/:id', function(request, response, next) {
  // callback//req.params
  var result;
  var query = {
    text: "SELECT DISTINCT ON(tipe_energy) id,tipe_energy  , v::float*i::float AS watt, (SELECT (kapasitas_baterai::float *tegangan_baterai::float) FROM public.user_account WHERE id  = $1) AS battery,( v::float*i::float / (SELECT (kapasitas_baterai::float *tegangan_baterai::float) FROM public.user_account WHERE id  = 1) * 100 )AS batcap , to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time FROM energy WHERE tipe_energy = 'battery'  ORDER BY tipe_energy ,receive_date DESC,receive_time DESC ",
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


var recomCaller = function(query) {
  var promise = new Promise(function(resolve, reject){
    var result;
    pool.query(query[0], (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {

        /*
            for (var i = 0; i < 3; i++) {
                if(res.rows[i].tipe_energy == 'battery'){
                  pv = res.rows[i].watt;
                }else if(res.rows[i].tipe_energy == 'pln'){
                  pln = res.rows[i].watt;
                }

              }
           
           result = {pv:pv,pln:pln}*/
           //"" + res.rows[0].batcap ;//.rows[0];
        //console.log(res)
              result = res.rows;
     
      }
     
    //  console.log('first method completed');
      resolve({query:query,batcap:result});
    
        
      });

  });
  return promise;
};

var recomChain = function(box) {
  var promise = new Promise(function(resolve, reject){
    var result;
    pool.query(box.query[1], (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {
           result= res.rows;//"" + res.rows[0].batcap ;//.rows[0];
        //console.log(res)
      //  result = res.rows[0].capex
      }
     
    //  console.log('first method completed');
      resolve({batcap:box.batcap ,pload:result});
    
        
      })
     
  });
  return promise;
};

var Rxls = function(box) {
  var promise = new Promise(function(resolve, reject){
    var data;

        node_xj({
          input: path.join( __dirname  ,'../xls/'+ "sample_data.xls"),  // input xls 
          output: null, // output json 
          lowerCaseHeaders:true
        }, function(err, result) {
          if(err) {
            data = err;
            console.error(err);
          } else {
            data = result;
            console.log(result);
          }
            //"date":"12/21/17"dat =
      //datmin = request.query.min;//request.body.min; 
      //datmax = request.query.max;//request.body.max;
         var output= jsonQuery('[*  tanggal='+ind.format('D')+' ]', {
           data: data
         }).value
      
   //      response.send(output); 
        // response.send(data); 
      //  c = {pln:output[0]['c pln'],pv:output[0]['c pv']}
        
        resolve({batcap:box.batcap,c:output,pload:box.pload});  
         
      });
   
      
  });
  return promise;
};

/** P load every hour
 * SELECT tipe_energy ,SUM( v::float*i::float) AS watt,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year 
FROM energy  WHERE tipe_energy = 'load' AND date_part('day', receive_date::date )= (SELECT date_part('day', receive_date::date )AS day FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY hour,day,month,year,receive_date,tipe_energy ORDER BY receive_date ASC 
 * **/
/* GET home page. */
router.get('/rekomendasi/:id', function(request, response, next) {
  // callback//req.params
  var query=[];
  query[0] = {
    text: "SELECT DISTINCT ON(tipe_energy) id,tipe_energy  , v::float*i::float AS watt, (SELECT (kapasitas_baterai::float *tegangan_baterai::float) FROM public.user_account WHERE id  = $1) AS battery,( v::float*i::float / (SELECT (kapasitas_baterai::float *tegangan_baterai::float) FROM public.user_account WHERE id  = $1) * 100 )AS batcap, to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time FROM energy WHERE tipe_energy = 'battery'  ORDER BY tipe_energy ,receive_date DESC,receive_time DESC ",
    values: [request.params.id]
  }

 query[1] = {
   text: " SELECT tipe_energy ,SUM( v::float*i::float) AS watt,receive_date ,date_part('hour', receive_time::time )AS hour,date_part('day', receive_date::date )AS day,date_part('month', receive_date::date )AS month,date_part('year', receive_date::date )AS year FROM energy  WHERE tipe_energy = 'load' AND date_part('day', receive_date::date )= (SELECT date_part('day', receive_date::date )AS day FROM energy ORDER BY receive_date DESC LIMIT 1) GROUP BY hour,day,month,year,receive_date,tipe_energy ORDER BY receive_date ASC ",
  values: [request.params.id]
 }

    savingCaller(query)
  //  .then(savingChain)
   // .then(Rxls)
    .then((successMessage) => {
      // successMessage is whatever we passed in the resolve(...) function above.
      // It doesn't have to be a string, but if it is only a succeed message, it probably will be.

      /**
        
           var capacity =  res.rows[0].batcap;
        if(capacity > 20){
          result="kombinasi";
        }else if(capacity < 20){
          result="pln";
        }

       **/
      console.log(successMessage);
      response.send(successMessage); 
    });

});

var savingCaller = function(query) {
  var promise = new Promise(function(resolve, reject){
    var result;
    pool.query(query[0], (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {

            for (var i = 0; i < 3; i++) {
                if(res.rows[i].tipe_energy == 'battery'){
                  pv = res.rows[i].watt;
                }else if(res.rows[i].tipe_energy == 'pln'){
                  pln = res.rows[i].watt;
                }

              }
           
           result = {pv:pv,pln:pln}
           //"" + res.rows[0].batcap ;//.rows[0];
        //console.log(res)

     
      }
     
    //  console.log('first method completed');
      resolve({query:query,p:result});
    
        
      });

  });
  return promise;
};

var savingChain = function(box) {
  var promise = new Promise(function(resolve, reject){
    var result;
    pool.query(box.query[1], (err, res) => {
      if (err) {
          result = err.stack;
        console.log(err.stack)
      } else {
           //result= res.rows[0];//"" + res.rows[0].batcap ;//.rows[0];
        //console.log(res)
        result = res.rows[0].capex
      }
     
    //  console.log('first method completed');
      resolve({p:box.p,capex:result});
    
        
      })
     
  });
  return promise;
};

var Cxls = function(box) {
  var promise = new Promise(function(resolve, reject){
    var data;

        node_xj({
          input: path.join( __dirname  ,'../xls/'+ "sample_data.xls"),  // input xls 
          output: null, // output json 
          lowerCaseHeaders:true
        }, function(err, result) {
          if(err) {
            data = err;
            console.error(err);
          } else {
            data = result;
            console.log(result);
          }
            //"date":"12/21/17"dat =
      //datmin = request.query.min;//request.body.min; 
      //datmax = request.query.max;//request.body.max;
         var output= jsonQuery('[* jam='+ind.format('H')+' & tanggal='+ind.format('D')+' ]', {
           data: data
         }).value
      
   //      response.send(output); 
        // response.send(data); 
        c = {pln:output[0]['c pln'],pv:output[0]['c pv']}
        
        resolve({p:box.p,c:c,capex:box.capex});  
         
      });
   
      
  });
  return promise;
};

//SELECT DISTINCT ON(tipe_energy) id,tipe_energy , v::float*i::float AS watt, v,i, to_char(receive_date, 'YY/MM/DD') AS receive_date,receive_time  FROM energy ORDER BY tipe_energy ,receive_date DESC,receive_time DESC
router.get('/saving/:id', function(request, response, next) {
  // callback//req.params
      var query=[];
       query[0] = {
        text: "SELECT tipe_energy ,SUM( v::float*i::float) AS watt FROM energy GROUP BY tipe_energy",
      }

      query[1] = {
        text: "SELECT  biaya_investasi,  lifetime_sistem_pv,biaya_investasi::float/(24* lifetime_sistem_pv::float  * 365 ) AS Capex FROM user_account WHERE id = $1;",
       values: [request.params.id]
      }

      /*
      pgsqlCaller(query).then((successMessage) => {
        // successMessage is whatever we passed in the resolve(...) function above.
        // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
        console.log(successMessage);
        response.send(successMessage); 
      });*/

      savingCaller(query)
      .then(savingChain)
      .then(Cxls)
      .then((successMessage) => {
        // successMessage is whatever we passed in the resolve(...) function above.
        // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
        console.log(successMessage);
        response.send(successMessage); 
      });

     

});

//var ind = moment().tz("Asia/Jakarta")
/*
router.get('/checkdate', function(request, response, next) {


//response.send({year:ind.format('YYYY'),month:ind.format('M'),date:ind.format('D'),hour:ind.format('H')});   
    Cxls()
    .then((successMessage) => {
      // successMessage is whatever we passed in the resolve(...) function above.
      // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
      console.log(successMessage);
      response.send(successMessage); 
    });

});*/


module.exports = router;