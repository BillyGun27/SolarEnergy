var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mqtt = require('mqtt');
var moment = require('moment-timezone');
var cors = require('cors');
//const formidable = require('express-formidable');


const client  = mqtt.connect('mqtt://iot.eclipse.org');//mqtt://127.0.0.1

const pool = require("./connectpg");

 
client.on('connect', function () {
  client.subscribe('machine')
  client.subscribe('sensor')
 // client.publish('sensor', '100')
 // client.publish('machine','0')
  //client.publish('machine','1')
})
 


var checkmqtt = "empty";
client.on('message', function (topic, message) {
  // message is Buffer
 // console.log(message.toString())
 checkmqtt = topic +"="+message.toString();
  console.log(checkmqtt);
 var ind = moment().tz("Asia/Jakarta")

 var table ,content;
 switch (topic) {
   case "machine":
    table = "mesin"
    content = "status_mesin";
  //  console.log(topic,"+",message.toString());
    Sendpgsql(table,content,message,ind);
     break;
   case "sensor":
    table = "sensor"
    content = "do_value";
   // checkmqtt = topic +"="+message.toString();
 // console.log(checkmqtt);
    Sendpgsql(table,content,message,ind);
     break;
   
 }
  



  // client.end()
})

function Sendpgsql(table,content,message,ind){
  console.log(table);
  var query = {
    // give the query a unique name
    name: table,
    text: 'INSERT INTO ' + table+ '('+ content +' ,receive_date,receive_time) VALUES ($1,$2,$3) ',
    values: [  message.toString()  ,ind.format('MM/DD/YY'),ind.format('HH:mm:ss')]//heroku
    // values: [  message.toString()  ,ind.format('DD/MM/YY'),ind.format('HH:mm:ss')]//my comp
  }

  // callback
pool.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log(res.rowCount)
  }
})

}

var data;
node_xj = require("xlsx-to-json-lc");
node_xj({
  input: "xls/sample_data.xls",  // input xls 
  output: null, // output json 
  lowerCaseHeaders:true
}, function(err, result) {
  if(err) {
    data = err;
   // console.error(err);
  } else {
    data = result;
  //  console.log(result);
  }
});

var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var data = require('./routes/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(formidable());
app.use(cors());

app.use('/', index);
app.use('/users', users);
app.use('/auth', auth);
app.use('/data',data);

app.get('/mqtt', function(request, response, next) {
  response.send(checkmqtt);
});

app.get('/testpg', function(request, response, next) {
  var ind = moment().tz("Asia/Jakarta");
  var query = {
    // give the query a unique name
    name: "mesin",
    text: 'INSERT INTO mesin (status_mesin ,receive_date,receive_time) VALUES ($1,$2,$3) ',
    values: [  '0'  ,ind.format('MM/DD/YYYY'),ind.format('HH:mm:ss')]
  }
  
   // callback
   var result;
      pool.query(query, (err, res) => {
        if (err) {
          console.log(err.stack)
          result = err.stack
        } else {
          console.log(res.rowCount)
          result = res.rowCount
        }
            response.send(result.toString() );
      })

 
} )


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
