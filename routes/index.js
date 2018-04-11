var express = require('express');
const path = require('path');
var router = express.Router();

var moment = require('moment-timezone');
//moment().format();

/* GET home page. */
router.get('/home', function(request, response, next) {
 
  response.sendFile(path.join( __dirname  ,'../public/App/Controller/Admin/home.html'));
  //var ind = moment().tz("Asia/Jakarta")
//console.log(moment.locale());         // en
//console.log(moment().format('LT'));   // 11:34 AM
//  response.send(ind.format('l') +"clock"+ ind.format('HH:mm:ss'));
});

router.get('/', function(request, response, next) {
 
  //response.sendFile(path.join( __dirname  ,'../public/App/Controller/Auth/login.html'));
  var ind = moment().tz("Asia/Jakarta")
//console.log(moment.locale());         // en
//console.log(moment().format('LT'));   // 11:34 AM
  response.send(ind.format('l') +"clock"+ ind.format('HH:mm:ss'));
});

//router.get('/upload', function(request, response, next) {
//  response.sendFile(path.join( __dirname  ,'../public/upload.html'));
//});


module.exports = router;