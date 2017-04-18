var security = require('./security');
var md5 = require('md5');
var mongoose = require('../modules/mongoose');
admins = require('../models/admins');
var users=admins.users; 

var superJson={};
    superJson.userName="admin";
    superJson.password="admin";
    superJson.merchantId="admin";
    superJson.password=security.encrypt(md5(superJson.password));
    superJson.type="SUPER";
    superJson.status="true";
 
  var query={"userName":superJson.userName,"type":superJson.type};
  var options={"upsert":true,"multi":true};

  users.update(query,superJson,options,function (err, data) {
     if (err)  console.log(err);
        console.log(data);
        process.exit();
});
/*
userName: 1 ,merchantId:1,status:1,type:1
docker run -it --volumes-from=data  --link mongo:mongo -e APPPATH="onlineServer" --rm jianyeruan/node /run.sh node modules/createSuper.js
*/