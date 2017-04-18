
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
     tools = require('../modules/tools'),
    security = require('../modules/security'),
    settings = require('../models/settings');
    
router.get('/', function(req, res, next) {
     log.debug(req.token);
       settings.find({}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});
router.get('/merchant/id', security.ensureAuthorized,function(req, res, next) {

     

     var query={"merchantId":req.token.merchantId};
     

       settings.findOne(query, function (err, data) {
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
 
   var arvind = new settings(info);
   settings.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
  
var id=req.params.id;
info.updatedAt=tools.defaultDate();
info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
var query = {"_id": id};
var options = {new: true};
 settings.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})

router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
     settings.remove({"_id":req.params.id}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
});

module.exports = router;

