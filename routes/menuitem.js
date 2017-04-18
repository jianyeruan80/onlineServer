
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    menuItem = require('../models/menuitem'),
    stores = require('../models/stores'),
    
    security = require('../modules/security'),
    md5 = require('md5'),
     util = require('util'),
    mgse = require('mongoose'),
    taxs = require('../models/taxs'),
    config = require('../modules/config'),
    jwt = require('jsonwebtoken');
    
     returnData={};
    returnData.success=true;

var groups = menuItem.groups;
var categorys = menuItem.categorys;
var items = menuItem.items;
var options = menuItem.globalOptions;


router.get('/optiongroups', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query={};
         query.merchantId=req.token.merchantId;

       options.aggregate(
           [ {$match:query},{ $sort: {"group":1,"order" : 1}},
           { $group : {_id : {$toUpper:"$group"},  min: { $max: "$minimun" },max: { $max: "$maximun" },
            groups:{$push:{"name":"$name","price":"$price","picture":"$picture", "value":"$_id","key":"$name"} } } },
            {$project:{group:1,min:1,max:1,groups:1}}
        ]
        ).exec(function(err,data){
            if (err) return next(err);

            returnData.message=data;
            res.json(returnData);
        })
        /* "optionInfo":{ $concat: [{ "$substr": ["$min",0,10] },"-",{ "$substr": ["$max",0,10] }] }*/

});

router.get('/options/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     
      

      options.findById(req.params.id,function (err, data) {

        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     
});
router.get('/options', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query={};
        query.merchantId=req.token.merchantId;
      options.find(query).sort({"group":1,"order":1}).exec(function (err, data) {

        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     
});
router.post('/option',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;  
log.debug(info);
   info.merchantId=req.token.merchantId;
     var arvind = new options(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/options/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var option = {new: true};
 options.findOneAndUpdate(query,info,option,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
router.delete('/options/:id',  security.ensureAuthorized,function(req, res, next) {
var query={};
query._id=req.params.id;

 options.remove(query,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})

router.get('/taxs', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query={};
        query.merchantId=req.token.merchantId;
        taxs.find(query).sort({"order":1}).exec(function (err, data) {
        if (err) return next(err);
         returnData.message=data;
         res.json(returnData);
      });
     
});
router.post('/tax',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;

   info.merchantId=req.token.merchantId;
     var arvind = new taxs(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/taxs/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;

var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 taxs.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
router.post('/categorysort/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
var query={};
var id=req.params.id;
  query._id= new mgse.Types.ObjectId(id);
  var options={"upsert":false,"multi":false};
   items.aggregate([
      { $match: query},
      { $lookup: {from: 'groups', localField: 'group', foreignField: '_id', as: 'groups'} },
      { $unwind: "$groups"},
      { $lookup: {from: 'categorys', localField: 'groups._id', foreignField: 'category', as: 'categorys'} },
       {$project:{'categorys':1}}
      ]).exec(function (err, data) {
        if (err) return next(err);
              for(var i=0;i<data[0].items.length;i++){
                      var orderJson={};
                      orderJson.order=1+i;
                     categorys.update({"_id":data[0].categorys[i]._id},orderJson,options,function (err, data) {
                        if (err) return next(err);
                        
                      });
            
         
            }
             returnData.message="OK";
             res.json(returnData);
      
      });

})
router.put('/itemsort/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
var query={};
var id=req.params.id;
  query._id= new mgse.Types.ObjectId(id);
  var options={"upsert":false,"multi":false};
   items.aggregate([
      { $match: query},
      { $lookup: {from: 'categorys', localField: 'category', foreignField: '_id', as: 'categorys'} },
      { $unwind: "$categorys"},
      { $lookup: {from: 'items', localField: 'categorys._id', foreignField: 'category', as: 'items'} },
        { $sort : { "items.order" : -1 } },
       {$project:{'items':1}}
      ]).exec(function (err, data) {
        if (err) return next(err);
              for(var i=0;i<data[0].items.length;i++){
                      var orderJson={};
                      orderJson.order=1+i;
                     items.update({"_id":data[0].items[i]._id},orderJson,options,function (err, data) {
                        if (err) return next(err);
                        
                      });
            
         
            }
             returnData.message="OK";
             res.json(returnData);
      
      });

})
router.post('/groupsort/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;

   info.merchantId=req.token.merchantId;
     var arvind = new taxs(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.delete('/taxs/:id',  security.ensureAuthorized,function(req, res, next) {
var query={};
query._id=req.params.id;

 taxs.remove(query,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
function compare(a, b) {
  return a.order - b.order;
}
/*drawApply.find().populate({
    path: 'salesId',
    select: '_id name phone merchant',
    model: 'sales',
    populate: {
        path: 'merchant',
        select: '_id sname',
        model: 'merchant'
    })
    .populate('approver', 'name')
    .populate('operator', 'name')
    .sort({createTime: -1}).exec(function(err, list) {
  // list of drawApplies with salesIds populated and merchant populated
});
books:{$push: {
             author:"$books.author",
             title:"$books.title",
             price:"$books.price",
             pages:"$books.pages"
         }}
*/
router.post('/menus',function(req, res, next) {
  
  log.debug(req.token);
 var info=req.body;
var query={}; 

var itemOption={};
var categoryOption={};
var recommend={};recommend.name="Recommend";recommend.items=[];
console.log("=============");
console.log(query);
console.log("=============");
      stores.findOne(info).exec(function (err, data) {
                                    if (err) return next(err);
                                    if(!data) return next(err);
                                    returnData.message={};
                                    returnData.message.store=data;
                                    query.merchantId=data.merchantId;

categorys.aggregate([
        {$match: query},
        {$unwind:"$options"},
        { $group:{
                _id:{ _id:"$_id",
                options:"$options.group"},
                min:{$first:"$options.minimun"},
                max:{$first:"$options.maximun"},
                options: {$push:"$options"}
            }
        },
        { $project:{
                   "_id":"$_id._id","group":"$_id.options",
                    "min":1,
                    "max":1,
                    "options":"$options"
          }
        },
        {
        $group: { _id:"$_id",groups: {$push:"$$ROOT"} }},
        ]).exec(function(err,groupData){
              for(var i=0;i<groupData.length;i++){
                categoryOption[groupData[i]._id]=groupData[i].groups;
              }
                
                items.aggregate([
                {$match: query},
                {$unwind:"$options"},
                { $group:{
                        _id:{ _id:"$_id",
                        options:"$options.group"},
                        min:{$first:"$options.minimun"},
                        max:{$first:"$options.maximun"},
                        options: {$push:"$options"}
                    }
                },
                { $project:{
                           "_id":"$_id._id","group":"$_id.options",
                            "min":1,
                            "max":1,
                            "options":"$options"
                  }
                },
                {
                $group: { _id:"$_id",groups: {$push:"$$ROOT"} }},
                ]).exec(function(err,data){
                     for(var i=0;i<data.length;i++){
                         itemOption[data[i]._id]=data[i].groups;
                        }

                            
                            
                            items.aggregate([
                          { $match: query},
                          { "$sort": { "order": 1} }, 
                          {$group : {_id : "$category",items: {$push:"$$ROOT"}}},
                          { $lookup: {from: 'categorys', localField: '_id', foreignField: '_id', as: 'categorys'} },
                          {$project:{_id:1, "categorys":1,"items":1}},
                          
                          {$unwind:"$categorys"},{ "$sort": { "categorys.order": 1} },          
                          {$project:{ "group":"$categorys.group","name":"$categorys.name","status":"$categorys.status",
                          "options":"$categorys.options","picture":"$categorys.picture","description":"$categorys.description",
                          "items":1,"order":"$categorys.order"}},
                          /* {$group : {_id : "$group",categorys: {$push:"$$ROOT"}}},
                           { $lookup: {from: 'groups', localField: '_id', foreignField: '_id', as: 'groups'} },
                          {$unwind:"$groups"},{ "$sort": { "groups.order": 1} },
                          {
                            $project:{"name":"$groups.name","picture":"$groups.picture","categorys":"$categorys","order":"$order"}
                          }*/


                          ]).exec(function (err, result) {
                            if (err) return next(err);
                           
                             for(var i=0;i<result.length;i++){
                                   delete result[i].options;
                                 //  for(var j=0;j<result[i].categorys.length;j++){
                                    
                                     for(var k=0;k<result[i].items.length;k++){
                                        result[i].items[k].options=[];
                                        var og=categoryOption[result[i].items[k].category]?categoryOption[result[i].items[k].category]:[];
                                        var ot=itemOption[result[i].items[k]._id]?itemOption[result[i].items[k]._id]:[];  
                                        result[i].items[k].options=og.concat(ot);
                                          if(!result[i].items[k].recommend){
                                              recommend.items.push(result[i].items[k]);
                                              //result[i].categorys[j].splice(k, 1);
                                          }
                                      }
                                // }

                             }
                             result.unshift(recommend); 
                          






                        // returnData.message.recommend=   recommend; 
                         returnData.message.menus=result;

                     console.log("-----xxxx----------------------");
                            console.log(util.inspect(result, false, null))

                       console.log("-----xxxx----------------------");

                             res.json(returnData);
                          
                          });

                      });




                     
                })

            
        })
})

router.get('/menus',security.ensureAuthorized,function(req, res, next) {
 log.debug(req.token);
var query={}; query.merchantId=req.token.merchantId;

                                  stores.findOne(query).exec(function (err, data) {
                                    if (err) return next(err);
                                    returnData.message={};
                                    returnData.message.store=data;
                                    
                            
                            items.aggregate([
                          { $match: query},
                          { "$sort": { "order": 1} }, 
                          {$group : {_id : "$category",items: {$push:"$$ROOT"}}},
                          { $lookup: {from: 'categorys', localField: '_id', foreignField: '_id', as: 'categorys'} },
                          {$project:{_id:1, "categorys":1,"items":1}},
                          
                          {$unwind:"$categorys"},{ "$sort": { "categorys.order": 1} },          
                          {$project:{ "group":"$categorys.group","name":"$categorys.name","status":"$categorys.status",
                          "options":"$categorys.options","picture":"$categorys.picture","description":"$categorys.description",
                          "items":1,"order":"$categorys.order"}},
                           
                          ]).exec(function (err, result) {
                            if (err) return next(err);
                           returnData.message.menus=result;
                          res.json(returnData);
                          
                          });

        })

       

})
/*router.get('/menus',security.ensureAuthorized,function(req, res, next) {
    
     log.debug(req.token);
     var query={};
         query.merchantId=req.token.merchantId;


  stores.findOne(query).exec(function (err, data) {
                if (err) return next(err);
                returnData.message={};
                returnData.message.name=data.name;
                returnData.message.tax=data.tax;

             
         https://maps.googleapis.com/maps/api/geocode/json?address=108-37%2043%20ave%20corona%2011368        
        
        items.aggregate([
      { $match: query},
      { "$sort": { "order": 1} }, 
      {$group : {_id : "$category",items: {$push:"$$ROOT"}}},
      { $lookup: {from: 'categorys', localField: '_id', foreignField: '_id', as: 'categorys'} },
      {$project:{_id:1, "categorys":1,"items":1}},
      {$unwind:"$categorys"},{ "$sort": { "categorys.order": 1} },          
      {$group : {_id : "$categorys.group",products: {$push:"$$ROOT"}}},
      { $lookup: {from: 'groups', localField: '_id', foreignField: '_id', as: 'groups'} },
      {$unwind:"$groups"},
      {$project:{"name":"$groups.name","order":"$groups.order","_id":"$groups._id","categorys":"$products"}},
       { "$sort": { "order": 1} }, 

      ]).exec(function (err, result) {
        if (err) return next(err);
         returnData.message.products=result;
         console.log("===============");
        console.log(returnData);
        console.log("===============");
         res.json(returnData);
      
      });

  });
});*/

router.get('/items/:id', security.ensureAuthorized,function(req, res, next) {

     log.debug(req.token);
       var query={};
     
       items.findById(req.params.id, function (err, data) {
        if (err) return next(err);
         returnData.message=data;
         console.log(data);
         res.json(returnData);
      });
     
});


router.get('/itemgroups', security.ensureAuthorized,function(req, res, next) {
   log.debug(req.token);
     var query=req.query;
         query.merchantId=req.token.merchantId;
        items.aggregate([
      { $match: query},
      { "$sort": { "order": 1} }, 
      {$group : {_id : "$category",items: {$push:"$$ROOT"}}},
      { $lookup: {from: 'categorys', localField: '_id', foreignField: '_id', as: 'categorys'} },
      {$project:{_id:1, category: {
                    $arrayElemAt: [ '$categorys', 0 ]
                  },"items":1}},
          { "$sort": { "category.order": 1} },          

      ]).exec(function (err, data) {
        if (err) return next(err);
   
            console.log(JSON.stringify(data));
            returnData.message=data;
         res.json(returnData);
      
      });
/*     log.debug(req.token);
        var query=req.query;
         query.merchantId=req.token.merchantId;

        items.find(query).populate('category').sort({"status":-1,"category":1,"order":1}).exec( function (err, data) {

        if (err) return next(err);
         
         returnData.message=data;
         console.log(data);
         res.json(returnData);
      });*/
     
});
router.post('/item',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
   info.merchantId=req.token.merchantId;
     var arvind = new items(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/items/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 items.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
router.delete('/items/:id',  security.ensureAuthorized,function(req, res, next) {
var query={};
query._id=req.params.id;

 items.remove(query,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})

router.get('/categorys', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query=req.query;
         query.merchantId=req.token.merchantId;
  
      
        categorys.find(query).sort({"order":1,"status":-1}).exec(function (err, data) {
        if (err) return next(err);
         returnData.message=data;

         res.json(returnData);
      });
     
      /*  categorys.aggregate([
      { $match: query},
      { "$sort": { "order": 1} }, 
      {$group : {_id : "$group",categorys: {$push:"$$ROOT"}}},
      { $lookup: {from: 'groups', localField: '_id', foreignField: '_id', as: 'groups'} },
      {$project:{_id:1, group: {
                    $arrayElemAt: [ '$groups', 0 ]
                  },"categorys":1}},
          { "$sort": { "group.order": 1} },          

      ]).exec(function (err, data) {
        if (err) return next(err);
   
            console.log(JSON.stringify(data));
            returnData.message=data;
         res.json(returnData);
      
      });*/
});

router.get('/categorygroups', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query=req.query;
         query.merchantId=req.token.merchantId;
        categorys.aggregate([
      { $match: query},
      { "$sort": { "order": 1} }, 
      {$group : {_id : "$group",categorys: {$push:"$$ROOT"}}},
      { $lookup: {from: 'groups', localField: '_id', foreignField: '_id', as: 'groups'} },
      {$project:{_id:1, group: {
                    $arrayElemAt: [ '$groups', 0 ]
                  },"categorys":1}},
          { "$sort": { "group.order": 1} },          

      ]).exec(function (err, data) {
        if (err) return next(err);
   
            console.log(JSON.stringify(data));
            returnData.message=data;
         res.json(returnData);
      
      });
});
router.put('/categorys/:id',  security.ensureAuthorized,function(req, res, next) {
    var info=req.body;
    log.debug(info);
    var id=req.params.id;
    info.updated_at=new Date();
    var query = {"_id": id};
    var options = {new: true};
     categorys.findOneAndUpdate(query,info,options,function (err, data) {
              if (err) return next(err);
              returnData.message=data;
              res.json(returnData);
        });
})
router.post('/category',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
   info.merchantId=req.token.merchantId;
     var arvind = new categorys(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.get('/categorys/:id',  security.ensureAuthorized,function(req, res, next) {
  log.debug(req.token);
     
      

      categorys.findById(req.params.id,function (err, data) {

        if (err) return next(err);
         returnData.message=data;
  
          res.json(returnData);
        })
})
router.delete('/categorys/:id',  security.ensureAuthorized,function(req, res, next) {
var query={};
query._id=req.params.id;

 categorys.remove(query,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
router.get('/groups/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query=req.query;
         query.merchantId=req.token.merchantId;
      
        groups.findById(req.params.id).sort({"order":1,"status":-1}).exec(function (err, data) {
        if (err) return next(err);
         returnData.message=data;

         res.json(returnData);
      });
     
});

router.get('/groups', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
     var query=req.query;
         query.merchantId=req.token.merchantId;
      
        groups.find(query).sort({"order":1,"status":-1}).exec(function (err, data) {
        if (err) return next(err);
         returnData.message=data;

         res.json(returnData);
      });
     
});
router.post('/group',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
   info.merchantId=req.token.merchantId;
     var arvind = new groups(info);
     arvind.save(function (err, data) {
      if (err) return next(err);
           returnData.message=data;
            res.json(returnData);
      });
})
router.put('/groups/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 groups.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
})
router.delete('/groups/:id',  security.ensureAuthorized,function(req, res, next) {
var query={};
query._id=req.params.id;

 groups.remove(query,function (err, data) {
          if (err) return next(err);
          returnData.message=data;
          res.json(returnData);
    });
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

