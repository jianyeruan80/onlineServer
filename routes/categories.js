
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
     groups = require('../models/groups'),
      tools = require('../modules/tools'),
    categories = require('../models/categories');
    
groups = require('../models/groups');


router.get('/merchantId', security.ensureAuthorized,function(req, res, next) {
 var query={"merchantId":req.token.merchantId,"status":"true"};
       
       categories.aggregate([
      {$match:query},
          {
        $lookup:
     {
       from: "items",
       localField: "_id",
       foreignField: "category",
       as: "itemsDoc"
     }
}
        ],function(err,data){
        if (err) return next(err);
          console.log("===========");
          console.log(data);
          console.log("===========");
          res.json(data);

})
/*       categories.find(query).populate({
    path: 'items'

  , options: { sort: { order: 1 }}
}).exec(function(err, data) {
       
        if (err) return next(err);
           
    
          res.json(data);
      });
     */
});

router.put('/sort/:id', security.ensureAuthorized,function(req, res, next) {
 var query={"group":req.params.id};
        

      
      var sortJson =req.body;
      console.log(sortJson)
      console.log("xxxxxxxxxxxxxxxxxxxxxx");
        categories.find(query, function(err, data) {
        if (err) return next(err);
        data.forEach(function(value, key) {
            if (sortJson[value._id]) {
                value.order = sortJson[value._id];
                value.save();
            }

        })
        res.json(data);
    });
     
});

router.get('/', security.ensureAuthorized,function(req, res, next) {
var query={"merchantId":req.token.merchantId};
     
       categories.find(query).populate({
    path: 'items'

  , options: { sort: { order: 1 }}}).exec(function(err, data) {
       
        if (err) return next(err);

        res.json(data);
      });
     
});



router.get('/groups/:id', security.ensureAuthorized,function(req, res, next) {
    var query={"group":req.params.id};
    categories.find(query).sort( { order: 1 } ).exec(function(err, data) {
       /*categories.find(query, function (err, data) {*/
        if (err) return next(err);
        res.json(data);
      });
/*   console.log("xxxxxxxxxxxxxxxxxxxxxxx");
    var query={"merchantId":req.token.merchantId};
    groups.aggregate(
   [
      {
       $match:query
      },
      {
        $lookup:
     {
       from: "categories",
       localField: "_id",
       foreignField:"group",
       as: 'categories_docs'
     }
      }
   ]
,function(err,data){
  res.json(data);

})
     */
});
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
      log.debug(req.token);
      
     
       categories.findOne({"_id":req.params.id}).populate({
    path: 'items'

  , options: { sort: { order: 1 }}
}).exec(function(err, data) {
      
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
   var dao = new categories(info);
       dao.save(function (err, data) {
    if (err) return next(err);
     
           res.json(data);
      });
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
    info.updatedAt=Date.now();
    info.operator={};
    info.operator.id=req.token.id;
    info.operator.user=req.token.user;
 categories.findByIdAndUpdate(req.params.id,info,{new:true},function (err, data) {
          if (err) return next(err);
          res.json(data);
/*            var query={"_id":info.group};
            var update={ $addToSet: {categories: data._id } };
          if(info.group != data.group){
               
               console.log("xxxxx==========xxxxxxxxxxx");
               groups.findOneAndUpdate(query,update,{},function (err, data2) {
                  if (err) return next(err);
                        query={"_id":data.group};
                        update={ $pull: {categories: data._id } };
                        groups.findOneAndUpdate(query,update,{},function (err, data2) {
                            if (err) return next(err);
                              //res.json(data);
                              res.json(data);
                        });
                  
              });
            

          }else{
            res.json(data);
          }
*/

          
    });
})

router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
         categories.findByIdAndUpdate(req.params.id,{"status":Date.now()},{new:true},function (err, data) {
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

