
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
    stores = require('../models/stores'),
     tools = require('../modules/tools'),
     licenses = require('../models/licenses'),
      merchants = require('../models/merchants'),
     licensesTool = require('../modules/licenses');
     router.get('/', function(req, res, next) {
     log.debug(req.token);
       stores.findOne({}).sort({"_id":-1}).exec(function (err, data) {
        if (err) return next(err);
          res.json(data);
      })
});
router.post('/licensesQuery',security.ensureAuthorized,function(req,res,next){
       licenses.find({}).sort( { "merchantId": -1 } ).exec(function(err,data){
              if (err) return next(err);
              var returnDate=data;
              res.json(data);
                    
        })
})     
router.post('/createLicensekey',security.ensureAuthorized,function(req,res,next){
  var info=req.body;
  info.createdAt=Date.now();       
 var p1=tools.getNextSequence({});
 p1.then(function(n){
 info.merchantId=n.seqNo;
 var licenseInfo={
      "pcKey":info.pcKey,
      "merchantId":info.merchantId,
      "month":info.month,
      "count":info.count,
      "createdAt":info.createdAt,
       "type":info.type,
       "delay":info.delay
 }
info["operator"]={
                id:req.token.id,
                user:req.token.user
 }
 info["licenseKey"]=licensesTool.createLicense(licenseInfo);
  var dao = new licenses(info);
                     dao.save(function (err, data) {
                     if (err) return next(err);
                       merchants.update({},{"seq":n.seqNo},function (err, data) {
                          if (err)  console.log(err);
                              //  process.exit();
                          });
                     res.json(data);
                    });
}, function(n) {
  res.json({"code":"90005"});
});
})
router.put('/createLicensekey/:id',security.ensureAuthorized,function(req,res,next){
 var info=req.body;
 var licenseKey=info.licenseKey;
 var activeKey=info.activeKey;
 info.createdAt=Date.now();

 if(!activeKey){
   var licenseInfo={
      "pcKey":info.pcKey,
      "merchantId":info.merchantId,
      "month":info.month,
      "count":info.count,
      "createdAt":info.createdAt,
       "type":info.type,
       "delay":info.delay
 }
 info["licenseKey"]=licensesTool.createLicense(licenseInfo);
 }else{
    delete info["licenseKey"];
    delete info["pcKey"];
    delete info["month"];
    delete info["delay"];
    delete info["type"];
    delete info["histories"];
 }

 info["operator"]={
                id:req.token.id,
                user:req.token.user
 }
 licenses.findById(req.params.id,function (err, data) {
       if (err) return next(err);
       if(!data)return next({"code":"910000"});
          if(!data.activeKey){

          }
          if(!licenseKey && !activeKey){
              
            info.histories=data.histories;
            var historiesData=JSON.parse(JSON.stringify(data));
            delete data["histories"];

            info.expires=historiesData.expires;
            info.histories.push(historiesData);
            info.activeKey=null;  
            console.log(info)
          }
          

          licenses.findByIdAndUpdate(req.params.id,info,{new:true},function (err, data) {
            if (err) return next(err);
               res.json(data);
             })   
         })
  })

router.post('/active',  function(req, res, next) {
  var info=req.body;
   
  var newInfo=licensesTool.decryptLicense(info.licenseKey);
  var newInfoJson=JSON.parse(newInfo); 
  var currentDate=Date.now(); 
      info.createdAt=currentDate; 
  var licenseInfo={
      "pcKey":newInfoJson.pcKey,
      "merchantId":newInfoJson.merchantId,
      "month":newInfoJson.month,
      "count":newInfoJson.count,
      "createdAt":currentDate,
      "type":newInfoJson.type,
      "delay":newInfoJson.delay
 }
   console.log(newInfoJson);

  if(newInfoJson.message){
    return next(newInfoJson); 
   }else{
      licenses.findOne({"licenseKey":info.licenseKey,"activeKey":null }, function (err, data) {
      if (err) return next(err);

      if(!data) return next({"code":"90012"});
      if(data.type=="Normal"  && !!data.expires && +new Date(data.expires)>currentDate ){
        currentDate=+new Date(data.expires);
      }
        licenseInfo.startDate=Date.now();
        licenseInfo.expires=currentDate+(newInfoJson.month*30+newInfoJson.delay)*24*60*60*1000;
        info["activeKey"]=licensesTool.createLicense(licenseInfo);
        info.startDate=licenseInfo.startDate;
        info.expires=licenseInfo.expires;
        licenses.findByIdAndUpdate(data._id,info,{new:true},function (err, data) {
            if (err) return next(err);
            console.log(data)
            res.json(data);
      })

   
   })
}
})
module.exports = router;

