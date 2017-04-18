
var merchants = require('../models/merchants');
var mongoose = require('../modules/mongoose');
var json={};
    json.seq="1";
    json.len="7";
 var query={};
 var options={"upsert":true,"multi":false};
 merchants.update(query,json,options ,function (err, data) {
     if (err)  console.log(err);
     process.exit();
});
  
/*  seq:Number,
      pre:String,
      createdAt:{type:Date,default:new Date()},
      len:Number
docker run -it --volumes-from=data  --link mongo:mongo -e APPPATH="jaynode" --rm jianyeruan/node /run.sh node modules/createSuper.js
docker run --volumes-from=data --link mongo:mongo -e APPPATH="LaundryServer" --rm jianyeruan/node /run.sh node modules/createMerchant.js
*/