var mongoose = require('mongoose');
var config = require('./config');
var log = require('./logs');
var dbIpAddress = process.env.MONGO_PORT_27017_TCP_ADDR || 'mongo';
var dbPort =  '27017';
var dbData=config.db;
var mongoose = require('mongoose')  
  , connectionString = 'mongodb://' + dbIpAddress + ':' + dbPort + '/'+dbData
  , options = {};
options = {  
  server: {
    auto_reconnect: true,
    poolSize: 5
  }
};
mongoose.connect(connectionString, options, function(err, res) {  
  if(err) {
    console.log('[mongoose log] Error connecting to: ' + connectionString + '. ' + err);
  } else {
    console.log('[mongoose log] connected to: ' + connectionString);
  }
});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));
db.once('open', function callback () {
 console.log('DB connection Successfully');
});
module.exports=mongoose;
