
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    orders = require('../models/orders'),
    bills = require('../models/bills'),
    security = require('../modules/security'),
    md5 = require('md5'),
    config = require('../modules/config'),
    jwt = require('jsonwebtoken');
     returnData={};
    returnData.success=true;


router.get('/orders', security.ensureAuthorized,function(req, res, next) {
     var query=req.query;
      query.merchant_id=req.token.merchant_id;
      orders.find(query, function (err, data) {
        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     
});
router.post('/order',security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
   info.merchant_id=req.token.merchant_id;
     var arvind = new orders(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/orders/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 orders.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})


router.get('/bills', security.ensureAuthorized,function(req, res, next) {
     var query=req.query;
      query.merchant_id=req.token.merchant_id;
      bills.find(query, function (err, data) {
        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     
});
router.post('/bill',security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
   info.merchant_id=req.token.merchant_id;
     var arvind = new bills(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/bills/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 bills.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})


/*router.get('/', function(req, res, next) {
    res.render('index', { title: 'Server is Running' });
})
router.post('/login', function(req, res, next) {
  log.debug(req.body);
   var query=req.body;
   query.password=security.encrypt(md5(query.password));
    users.findOne(query ,function (err, data) {
    if (err) return next(err);
    if (!data) return next({"code":"90002"});
    var json={};
     json.accessToken = jwt.sign({"type":query.type},req.app.get("superSecret"), {
          expiresIn: '10000m',
          algorithm: 'HS256'
        });

     returnData.message=json;
     res.json(returnData);
  });
});
router.get('/orders', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
      var query={"type":"ADMIN"};
      if(req.token.type="SUPER"){
        var select={"merchant_ids":1,"username":1,"password":1,"status":1,"permissions":1,"type":1};
       users.find(query ,select, {sort: {"_id": -1}}, function (err, data) {
        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     }
});

router.get('/perms', security.ensureAuthorized,function(req, res, next) {
 log.debug(req.token);
  if(req.token.type=="SUPER"){
         permissions.aggregate(
           [ { $group : {_id : "$permission_group",  order: { $min: "$order" },perms:{$push:{"subject":"$subject","action":"$action","perm":"$perm","status":"$status","value":"$_id","key":"$perm","order":"$order","merchant_ids":"$merchant_ids"} } } }
        ]
        ).sort({"order" : 1}).exec(function(err,data){
            if (err) return next(err);
            returnData.message=data;
            res.json(returnData);
        })
    }
});
router.post('/user',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
    info.password=security.encrypt(md5(info.password));
    var arvind = new users(info);
      arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
                    });
                        
  } 
})

router.put('/users/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
var options={"upsert":false,"multi":false};
       var id=req.params.id;
                     info.updated_at=new Date();
                     if(!info.password) delete info.password;
                     if(!!info.password) info.password=security.encrypt(md5(info.password));
                     
var query = {"_id": id};
var options = {new: true};*/
/*var update = {name: {first: 'john', last: 'smith'}};
var options = {new: true};*/

/*var update = {name: {first: 'john', last: 'smith'}};
区别 findAndModify是有返回值的，输出中的value字段即返回修改之前的文档，
使用 new:true选项返回修改后的文档。 update是更新操作，是没有返回值的。
 findAndModify 强调操作的原子性（atomically），
 比如用来实现自增1的操作或者操作队列。属于 get-and-set 式的操作，一般来讲，findAndModify 比update操作稍慢，因为需要等待数据库的响应
});
db.collection.findAndModify({
    query: <document>,
    sort: <document>,
    remove: <boolean>,
    update: <document>,
    new: <boolean>,
    fields: <document>,
    upsert: <boolean>,
    bypassDocumentValidation: <boolean>,
    writeConcern: <document>
});

                     users.findOneAndUpdate(query,info,options,function (err, data) {
                          if (err) return next(err);
                          returnData.message=data;
                             res.json(returnData);
                      });
                        
  } 
})


router.post('/perm', security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
       var arvind = new permissions(info);
                                arvind.save(function (err, data) {
                              if (err) return next(err);
                                       returnData.message=data;
                                       res.json(returnData);
                              });
                                  
                        
                    
                  
       
  }
 
})

router.put('/perms/:id', security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
        var id=req.params.id;
        var options={"upsert":false,"multi":false};
                   info.updated_at=new Date();
                   permissions.update({"_id":id},info,options,function (err, data) {
                        if (err) return next(err);
                            returnData.message=data;
                            res.json(returnData);
                      });
                   
       
  }
 
})

router.put('/users/:id/perms', security.ensureAuthorized, function(req, res, next) {
     var info=req.body;
     if(req.token.type=="SUPER"){
       var options={"upsert":false,"multi":false};
       var id=req.params.id;
       var options = {new: true};
        users.findOneAndUpdate({"_id":id},{"permissions":info.permissions},options,function (err, data) {
                          if (err) return next(err);
                          returnData.message=data;
                             res.json(returnData);
                      });
        
      }
 

})

router.get('/perms/:id', security.ensureAuthorized, function(req, res, next) {
log.debug(req.body);
  var id=req.params.id;
  var query={"_id":id};
   if(req.token.type=="SUPER"){
      permissions.findOne(query, function (err, data) {
        if (err) return next(err);
    
         returnData.message=data;
         res.json(returnData);
      });
    }
})

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

