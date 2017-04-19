
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    tools = require('../modules/tools'),
    async=require('async'),
     util = require('util'),
    security = require('../modules/security'),
    customers = require('../models/customers');
    /*security.ensureAuthorized,*/
    router.post('/query',  function(req, res, next) {
       var info=req.body;
       var search="";
       var status=(!!info.searchData["status"]).toString();
       if(!!info.searchData && !!info.searchData["searchInfo"]){
           search=info.searchData["searchInfo"];
       }
      /*var query={$and:[{"merchantId":req.token.merchantId,"status":"true"}]};*/
      var query={$and:[{"status":"true"}]};
       if(status !="true")query={$and:[{"merchantId":req.token.merchantId,"status":{$ne:"true"}}]};
       if(!!search)   {
         query["$and"].push({
              $or:[
                      {"email":{$regex:search,$options: "i"}},//'email':new RegExp("^"+req.body.email+"$", 'i'),
                      {"phoneNum1":{$regex:search,$options: "i"}},
                       {"phoneNum2":{$regex:search,$options: "i"}},
                      {"firstName":{$regex:search,$options: "i"}},
                      {"lastName":{$regex:search,$options: "i"}},
                ]  
            })
       }
       async.parallel({
       count: function (done) {
         console.log(query)
         customers.count(query, function (err, data) {
             if (err) return done(err,{});
              done(null,data);
         });
       },
       data: function (done) {
         var currentPage=info.page-1>0?info.page-1:1;
          customers.find(query).skip(info.pageOnCount*(info.page-1)).limit(info.pageOnCount).exec(function (err, data) {
             if (err) return done(err,{});
             done(null,data);
        });

       }

       }, function (err, result) {
            if (err) return next(err);
            var returnData={};
             returnData.total=result.count;
             returnData.data=result.data;
             res.json(returnData);
       })
})
   

    
router.get('/', function(req, res, next) {
     log.debug(req.token);
       customers.find({}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});
router.get('/merchants/id', security.ensureAuthorized, function(req, res, next) {
     var query={"merchantId":req.token.merchantId,"status":"true"};
       customers.find(query, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});

router.get('/query',  security.ensureAuthorized,function(req, res, next) {
       
       var info=req.query;
       var search=info.search || "";
       var query={
           $and:[
            {"merchantId":req.token.merchantId,"status":"true"},
            {
              $or:[
                      {"email":{$regex:search,$options: "i"}},//'email':new RegExp("^"+req.body.email+"$", 'i'),
                      {"phoneNum1":{$regex:search,$options: "i"}},
                      {"phoneNum2":{$regex:search,$options: "i"}},
                      {"firstName":{$regex:search,$options: "i"}},
                      {"lastName":{$regex:search,$options: "i"}},
                ]  
            }
           ]
       }       
customers.find(query, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
})
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       customers.findById(req.params.id, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
     
});

router.post('/',  security.ensureAuthorized,function(req, res, next) {
  var info=req.body;
      info.createdAt=tools.defaultDate(req.token.zoneInfo);
      info.updatedAt=tools.defaultDate(req.token.zoneInfo);
      info.merchantId=req.token.merchantId; 
      info.operator={};
      info.operator.id=req.token.id;
      info.operator.user=req.token.user;
   var dao = new customers(info);
   dao.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
info.updatedAt=tools.defaultDate(req.token.zoneInfo);
var options = {new: true};
info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
info.updatedAt=tools.defaultDate(req.token.zoneInfo);
 customers.findByIdAndUpdate(req.params.id,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})
router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
var info=req.body;
info.updatedAt=tools.defaultDate();
info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
info.status=new Date().getTime();
 customers.findByIdAndUpdate(req.params.id,info,{new: true},function (err, data) {
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

