
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
    categories = require('../models/categories'),
    async=require('async'),
    tools = require('../modules/tools'),
    stores = require('../models/stores'),
    groups = require('../models/groups'),
    util = require('util'),
    returnData={},
    items = require('../models/items');
    var mongoose = require('mongoose');
const categoriesView = new Schema( {}, { strict: false });
const QUERY_COMPANY = mongoose.model('categoriesView', categoriesView, 'categoriesView');
/*QUERY_COMPANY.find({
    "_id": userID
}, (err, doc) => {
     if (err) {
        console.err(err)
     } else {
        console.log('vpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvps')
        console.log(JSON.stringify(doc))
        console.log('vpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvps')
    }
});*/
router.get('/merchantId', security.ensureAuthorized,function(req, res, next) {
var query={"merchantId":req.token.merchantId};
     //categories.find(query).populate({path:'items', 
       // options: { sort: { order: 1 }}}).sort({order:1}).exec(function(err, data) {
        categories.find(query).exec(function(err, data) {
        if (err) return next(err);
        console.log("====================");
        console.log(data);
        console.log("====================");
        res.json(data);
      });
     
});
router.get('/categories/:id', security.ensureAuthorized,function(req, res, next) {

     var query={"category":req.params.id,"status":"true"};
     items.find(query).sort( { order: 1 } ).exec(function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});

router.put('/sort/:id', security.ensureAuthorized,function(req, res, next) {
 var query={"category":req.params.id};
        
      var sortJson =req.body;
      console.log(sortJson)
      var len=Object.keys(sortJson).length;
        items.find(query, function(err, data) {
        if (err) return next(err);
        data.forEach(function(value, key) {
            if (sortJson[value._id]) {
                value.order = sortJson[value._id];
                value.save();
                
                console.log(len);
                console.log(key+1);
                if(len==key+1){
                  res.json({"len":key});
                }
            }

        })
        
    });
     
});



router.get('/menus/:merchantId',function(req, res, next) {
 var info=req.query;
///var info=req.params.merchantId; 
var query={}; query.merchantId=req.params.merchantId;
console.log(query);
/*async.parallel({
    one: function (done) {
      stores.findOne(query).exec(function (err, data) {
        if (err) return  done(err,err);          
                 done(null,data);
         
      })
    },
    two: function (done) { */
      QUERY_COMPANY.find({
   
}, (err, doc) => {
     if (err) {
        console.err(err)
     } else {
        console.log('vpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvps')
        console.log(JSON.stringify(doc))
        console.log('vpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvpsvps')
    }
});
      QUERY_COMPANY.aggregate([
      {  $match:{}}
/*      , 
                          {$lookup:
                           {
                             from: "itemsView",
                             localField: "_id",
                             foreignField: "category",
                             as: "items"
                           }
                          } */ ]
          ,function(err,data){
             if (err) return next(err);
             console.log(data)
            res.json(data);

          })
    

   // }

/*
}, function (err, result) {
    if(!!err){console.log(err); return next(err)}
   var returnJson={};
    returnJson.store=result.one;
    returnJson.menus=result.two;
   res.json(returnJson)
}) */
 
})
router.get('/group', security.ensureAuthorized,function(req, res, next) {
    
    var query={"merchantId":req.token.merchantId};
    categories.aggregate(
   [
      {
       $match:query
      },
      {
        $lookup:
     {
       from: "items",
       localField: "_id",
       foreignField:"category",
       as: 'items_docs'
     }
      }
   ]
,function(err,data){
  res.json(data);

})

     
});
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       items.findById(req.params.id, function (err, data) {
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
        var dao = new items(info);
        dao.save(function (err, data) {
        if (err) return next(err);
          res.json(data);
       })
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
       info.updatedAt=Date.now();
       info.operator={};
       info.operator.id=req.token.id;
       info.operator.user=req.token.user;
       items.findByIdAndUpdate(req.params.id,info,{new:true},function (err, data) {
          if (err) return next(err);
           res.json(data);
     })      
})

router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
      var info=req.body;
       info.updatedAt=Date.now();
       info.operator={};
       info.operator.id=req.token.id;
       info.operator.user=req.token.user;
       info.status=Date.now();
       console.log(req.params.id)
       items.findByIdAndUpdate(req.params.id,info,{new:true},function (err, data) {
          if (err) return next(err);
           res.json(data);
     })      
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

