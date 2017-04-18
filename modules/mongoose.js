var mongoose = require('mongoose');
var config = require('./config');
var log = require('./logs');
var dbIpAddress = process.env.MONGO_PORT_27017_TCP_ADDR || 'mongo';
var dbPort =  '27017';
var dbData=config.db;
 mongoose.connect('mongodb://' + dbIpAddress + ':' + dbPort + '/'+dbData, function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log('DB connection successful');
    }
});
module.exports=mongoose;
