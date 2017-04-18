
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
              res.json(data);
                    
        })
})     
router.post('/createLicensekey',security.ensureAuthorized,function(req,res,next){
     
       var info=req.body;
       var query={"pcKey":info.pcKey};
           info.createdAt=Date.now();       
var p1=tools.getNextSequence({});
 p1.then(function(n){
  info.merchantId=n.seqNo;
 info.licenseSub["merchantId"]=n.seqNo;
 info.licenseSub["storeName"]=info.storeName || "";
 info.licenseSub["createdAt"]=Date.now();

 info.licenseSub["key"]=licensesTool.createLicense(info.licenseSub);
 info.licenseSub["contact"]=info.contact || "";
 info.licenseSub["phone"]=info.phone || "";
 info.licenseSub["email"]=info.email || "";
 
         info.licenseSub["operator"]={
                id:req.token.id,
                user:req.token.user
          }
 info["newKey"]=info.licenseSub["key"];
                 info.licenseKey=[info.licenseSub]; 
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
 var query={"pcKey":info.pcKey};
 info.merchantId=info.licenseSub["merchantId"];
 info.licenseSub["storeName"]=info.storeName || "";
 info.licenseSub["createdAt"]=Date.now();
 info.licenseSub["key"]=licensesTool.createLicense(info.licenseSub);

 info["newKey"]=info.licenseSub["key"];
 info.licenseSub["contact"]=info.contact || "";
 info.licenseSub["phone"]=info.phone || "";
 info.licenseSub["email"]=info.email || "";

         info.licenseSub["operator"]={
                id:req.token.id,
                user:req.token.user
 }
 licenses.findById(req.params.id,function (err, data) {
       if (err) return next(err);
       if(!data)return next({"code":"910000"});
          data.licenseKey.push(info.licenseSub);
          info.licenseKey=data.licenseKey;
          info.licenseKey.sort(function(a, b) {
            return a.pcKey > b.pcKey;
          });
          licenses.findByIdAndUpdate(req.params.id,info,{new:true},function (err, data) {
            if (err) return next(err);
               res.json(data);
             })   

  })
  })


router.post('/decrypt',  function(req, res, next) {
  var info=req.body;

  var key=licenses.decryptLicense(info.licenseKey);  
  try{
          var keyJSON=JSON.parse(key);
           console.log(keyJSON);
        console.log(keyJSON.merchantId);
        if(keyJSON.merchantId==info.merchantId && keyJSON.active==true){
            var currentDate=tools.defaultDate();
            var expires=new Date(keyJSON.expires);
         
keyJSON.expiresTotal=Math.ceil(new Date(currentDate-expires).getTime()/(24*60*60*1000));
   if(currentDate>expires){
               keyJSON.active=false;
                res.json(keyJSON);
            }else{
            
              res.json(keyJSON);
            }
        }else{
             return next({"code":"90007"});
  }
  }catch(ex){
        return next({"code":"90007"});
  }
 

})
router.post('/active',  function(req, res, next) {
  var info=req.body;
  var newInfo=licensesTool.decryptLicense(info.key);
    
   if(newInfo.message){
    res.json(newInfo); 
   }else{

     licenses.findOne({licenseKey: { $elemMatch: { key: info.key, activeKey:{$exists:false}} } }, function (err, data) {
     var returnData=JSON.parse(JSON.stringify(data));
    
     if (err) return next(err);
     if(!returnData){
      return next({"code":"90012"});
     }
      var currentDate=Date.now();
    
        newInfo=JSON.parse(newInfo);
        newInfo.startDate=Date.now();
       newInfo.expires=currentDate+ newInfo.month*(30+newInfo.delay)*24*60*60*1000;
       var activeKey= licensesTool.createLicense(newInfo);
        if(returnData.licenseKey.length>0){
             for(var i=0;i<returnData.licenseKey.length;i++){
               if(returnData.licenseKey[i].pcKey==newInfo.pcKey && returnData.licenseKey[i].status==true){
                    returnData.licenseKey[i].expires=+new Date(returnData.licenseKey[i].expires);
                    if(currentDate < returnData.licenseKey[i].expires){
                       currentDate=returnData.licenseKey[i].expires;

                     }
                      returnData.licenseKey[i].status=false;
                     
                 
                    
                 }
             }
              newInfo.expires=currentDate+newInfo.month*(30+newInfo.delay)*24*60*60*1000;
              activeKey= licensesTool.createLicense(newInfo);
              for(var i=0;i<returnData.licenseKey.length;i++){
                
                 if(returnData.licenseKey[i].key==info.key){
                    returnData.licenseKey[i].activeKey=activeKey;
                    returnData.licenseKey[i].startDate=newInfo.startDate;
                    returnData.licenseKey[i].expires=newInfo.expires;
                    returnData.licenseKey[i].status=true;
                    break;
                 }
             }
       
       
         }

     licenses.findByIdAndUpdate(data._id,returnData,{new:true},function (err, data) {
          if (err) return next(err);
              returnData={};
              returnData.merchantId=data.merchantId;
              returnData["licenseKey"]=[];
              data.licenseKey.forEach(function(v,k){
                if(v.status==true && !!v.activeKey){
                  returnData["licenseKey"].push({key:v.pcKey,value:v.activeKey});
                }
              })
           res.json(returnData);
      })
   })
}
})

router.get('/qrc/:id',function(req, res, next) {
      var query={"qrcUrl":req.params.id};
     stores.findOne(query, function (err, data) {
        if (err) return next(err);
        console.log(data);
         res.json(data);
      });
     
});
router.get('/merchantId/:id',function(req, res, next) {
      var query={"merchantId":req.params.id};
     stores.findOne(query, function (err, data) {
        if (err) return next(err);
        console.log(data);
         res.json(data);
      });
     
});
router.get('/merchants/id', security.ensureAuthorized,function(req, res, next) {
   
     var query={"merchantId":req.token.merchantId};
       stores.findOne(query, function (err, data) {
        if (err) return next(err);
        console.log(data);
         res.json(data);
      });
     
});
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       stores.findById(req.params.id, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
     
});

router.post('/',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
   info.merchantId=req.token.merchantId; 
   info.operator={};
   info.operator.id=req.token.id;
   info.operator.user=req.token.user;
   info.addressInfo.loc={
      "type":"Point","coordinates":[40.751351,-73.8597127]
  }
  var arvind = new stores(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
info.updatedAt=tools.defaultDate();
info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
info.merchantId=req.token.merchantId;
var query = {"merchantId": req.token.merchantId};
var options = {new: true,upsert:true};

//try{
  //info.addressInfo.40.7623381,-73.8474097 location.coordinates=info.addressInfo.location.coordinates?info.addressInfo.location.coordinates.split(","):[];}catch(ex){}
 stores.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})
router.delete('/',function(req, res, next) {
     stores.remove({}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
});
router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
     stores.remove({"_id":req.params.id}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
});

module.exports = router;

/*
var PersonSchema = new Schema({
      name:{
        first:String,
        last:String
      }
    });
  PersonSchema.virtual('name.full').get(function(){
      return this.name.first + ' ' + this.name.last;
    });

Post.find({}).sort('test').exec(function(err, docs) { ... });
Post.find({}).sort({test: 1}).exec(function(err, docs) { ... });
Post.find({}, null, {sort: {date: 1}}, function(err, docs) { ... });
Post.find({}, null, {sort: [['date', -1]]}, function(err, docs) { ... });

db.inventory.aggregate( [ { $unwind: "$sizes" } ] )
db.inventory.aggregate( [ { $unwind: { path: "$sizes", includeArrayIndex: "arrayIndex" } } ] )
https://docs.mongodb.com/manual/reference/operator/aggregation/group/
[
   /*{ $project : { title : 1 , author : 1 } } addToSet*/
/*    { $match: { status: "A" } },*
 { $group : {_id : "$permission_group", perms:{$push:{"subject":"$subject","action":"$action","perm":"$perm","status":"$status","value":"$_id","key":"$perm"} } } }
  // _id : { month: "$permission_group", day: { $dayOfMonth: "$date" }, year: { $year: "$date" } }

  /*    {
        $group : {
          _id:{permissionGroup:"$permission_group",subjects:{$push:"$subject"}}
         
    sort({"order" : 1})
        }
      }*/
/*users.update({"_id":key},{"$addToSet":{"permissions":{"$each":info.value}}},function(err,data){*/


