var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./modules/config');
var admins = require('./routes/admins');
var W3CWebSocket = require('websocket').w3cwebsocket;

var superAdmin = require('./routes/superadmin');
/*var background = require('./routes/background');*/
/*var menuitem = require('./routes/menuitem');*/
var stores = require('./routes/stores');
var customers = require('./routes/customers');
var storeHours = require('./routes/storeHours');
var groups = require('./routes/groups');
var globalOptionGroups = require('./routes/globalOptionGroups');
var categories = require('./routes/categories');
var items = require('./routes/items');
var debug = require('./routes/debug');
var orders = require('./routes/orders');
var seqs = require('./routes/seqs');
var licenses=require('./routes/licenses');
var settings=require('./routes/settings');
var ejs = require('ejs');
var multiparty = require('multiparty');
var log=require('./modules/logs');
var mongoose = require('./modules/mongoose');
var util  =   require('util');
var security = require('./modules/security');
var tools = require('./modules/tools');
var mkdirp = require('mkdirp');

var compress = require('compression');
var rest = require('restler');
var timerID=0;
var apiToken={};
var returnData={};
returnData.success=true;
var startNow=Date.now();
var app = express();
app.use(compress());

app.engine('html',ejs.__express) ;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('superSecret',"ruanjy520");
app.set('port',"3999");
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));


app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb',extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

app.get('/', function (req, res) {
    res.send("index", "Start");
});
app.use('/superadmin', superAdmin);
app.use('/api/admin', admins);
app.use('/api/logs', debug);
app.use('/api/stores', stores);
app.use('/api/customers', customers);
app.use('/api/storehours', storeHours);
app.use('/api/groups', groups);
app.use('/api/globalOptionGroups', globalOptionGroups);
app.use('/api/categories', categories);
app.use('/api/items', items);
app.use('/api/orders', orders);
app.use('/api/settings',settings);
app.use('/api/licenses',licenses);



app.post('/api/upload',security.ensureAuthorized,function(req, res, next) {
/*console.log(req.token.merchantId);
var fold=req.token.merchantId;
var photoPath=path.join(__dirname, 'public')+'/'+fold;
mkdirp(photoPath, function (err) {
    if (err) console.error(err)
    else console.log('pow!')
});
var form = new multiparty.Form({uploadDir:  photoPath});
var  store={};
     store.success=true;
    form.parse(req, function(err, fields, files) {

    store.message=files;

   res.json(store);
 })*/
 })
app.post('/api/uploadPic/:id',function(req, res, next) {
var fold=req.params.id;
if(fold){
    var photoPath=path.join(__dirname, 'public')+'/'+fold;
    console.log(photoPath);
    mkdirp(photoPath, function (err) {
        if (err) console.error(err)
        else console.log('pow!')
    });
    var form = new multiparty.Form({uploadDir:  photoPath});
        var picJson={};
        
        form.parse(req, function(err, fields, files) {
         console.log(fields);
         console.log(files);

             if(!!files.file && !!files.file[0] &&  !!files.file[0].path){
              var path=files.file[0].path.split("/");
              pic=path[path.length-2]+'/'+path[path.length-1];
              picJson["key"]=fields.input[0];
              picJson["value"]=pic
              
             
           } 
          res.json(picJson);
     })
  }else{
    return next({"code":"90001"});
  }
 })
 var customerError={
         "11000":"Item already exists !",
         "90001":"token not match !",
         "90002":"user password is not match !",
         "90003":"User Type not match !",
         "90004":"Your account is disable,please contant admin !",
         "90005":"Your Link is false !",
         "90006":"Save order is fail !",
         "90007":"License is fail !" ,
         "90008":"License is expires !" ,
         "90009":"User or password already exists!",
         "90010":"Transfer parameters is error !",
         "90011":"PC Key already exists !",
         "90012":"licnese is used !",
         "99999":"Transfer parameters is error !"
 }

app.get('/api/ext',function(req, res, next) {
    var info = req.query;
    var address={};
    var args = {};
    console.log(info)
     var address=info.address;
      rest.get("api/stores").on('complete', function(data, response) {
        if (data instanceof Error) return next(data);
         console.log(data);
        // address.message=data.results[0];
         return   res.json(data.results[0]);
    });

 })

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
 if(Date.now()-startNow>500){
     startNow=Date.now();
    next(err);
 }
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.error("Error:" + err.message);

    res.status(err.status || 200).json({
      code:err.code,
      message: customerError[err.code]?customerError[err.code]:err.message,
     });
  });
}

app.use(function(err, req, res, next) {
  
  console.error("Error: " + err);
   res.status(err.status || 200).json({
      code:err.code,
      message: customerError[err.code]?customerError[err.code]:err.message,
     });
});
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server is running at http://%s:%s', host, port)
});
