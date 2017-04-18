
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

router.get('/merchants/id', security.ensureAuthorized,function(req, res, next) {

   

     var query={"merchantId":req.token.merchantId};
     
       categories.find(query).populate({path:'items', options: { sort: { order: 1 }}}).sort({order:1}).exec(function(err, data) {
       /*categories.find(query, function (err, data) {*/
        if (err) return next(err);
       
        res.json(data);
      });
     
});
router.get('/categories/:id', security.ensureAuthorized,function(req, res, next) {

     var query={"category":req.params.id};
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

router.get('/menus',security.ensureAuthorized,function(req, res, next) {
 	 
 log.debug(req.token);
var info=req.params; 
var query={}; query.merchantId=req.token.merchantId;

async.parallel({
    one: function (done) {
      stores.findOne(query).exec(function (err, data) {
        if (err) return  done(err,err);          
                 done(null,data);
         
      })
             
    },
    two: function (done) {  //Laundry + Merchandise = Grand Total
         query.status=true;
         query.type = info.type || "Product";
          groups.find(query).populate(
             {
              path: 'categories',
              populate: [{ path: 'items', match: {status:true},options: { sort: { order: 1 }},populate: { path: 'globalOptions'}},{path: 'globalOptions'}],
              match: {status:true}, 
              options: { sort: { order: 1 }}
              }
            ).populate("globalOptions").sort({order:1}).exec(function(err, data) {    
                 if (err) return  done(err,err); 
                     done(null,data);
                })
    }


}, function (err, result) {
    if(!!err){console.log(err); return next(err)}
 console.log("xxxxxxxxxxxxx");
     console.log(result);
 console.log("-------------------");
    var returnJson={};
    returnJson.store=result.one;
    returnJson.menus=result.two;
   res.json(returnJson)
}) 
 
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
      /* categories.findOne(query, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });*/
     
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
   
   if(info.groupName){
      var groupDao=new groups({"merchantId":info.merchantId,"name":info.groupName});
       groupDao.save(function (err, groupData) {
          if (err) return next(err);
             if(info.categoryName){
                var categoryDao=new categories({"merchantId":info.merchantId,"name":info.categoryName,"group":groupData._id});
                   categoryDao.save(function (err, categoryData) {
                      if (err) return next(err);
                        var query={"_id":groupData._id}
                        var update={ $addToSet: {categories: categoryData._id } };
                         groups.findOneAndUpdate(query,update,{},function (err, groupData) {
                              if (err) return next(err);
                               info.category=categoryData._id;
				 var dao = new items(info);
   dao.save(function (err, data) {
   if (err) return next(err);
            var query={"_id":data.category}
            var update={ $addToSet: {items: data._id } };
            categories.findOneAndUpdate(query,update,{},function (err, data2) {
                  if (err) return next(err);
                   res.json(data);
            });
         // res.json(data);
      });
                   
     });
                   })
             }
       })
   }else{
   
   var dao = new items(info);
   dao.save(function (err, data) {
   if (err) return next(err);
            var query={"_id":data.category}
            var update={ $addToSet: {items: data._id } };
            categories.findOneAndUpdate(query,update,{},function (err, data2) {
                  if (err) return next(err);
                   res.json(data);
            });
         // res.json(data);
      });
  }
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
   
var info=req.body;
var id=req.params.id;
info.updatedAt=tools.defaultDate();
  info.operator={};
       info.operator.id=req.token.id;
       info.operator.user=req.token.user;
var query = {"_id": id};
var options = {new: false};
 items.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
            var query={"_id":info.category};
            var update={ $addToSet: {items: data._id } };
          if(info.category != data.category){
                categories.findOneAndUpdate(query,update,{},function (err, data2) {
                  if (err) return next(err);
                     query={"_id":data.category};
                    update={ $pull: {items: data._id } };
                    categories.findOneAndUpdate(query,update,{},function (err, data2) {
                        if (err) return next(err);
                          res.json(data);
                         // res.json(data);
                    });
                 
              });
           
               
          }else{
            res.json(data);
          }

    });
})

router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
     items.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return next(err);
              var query={"_id":data.category}
              var update={ $pull: {items: data._id } };
              categories.findOneAndUpdate(query,update,{},function (err, data2) {
                    if (err) return next(err);
                      res.json(data);
              });
              
             // res.json(data);
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

