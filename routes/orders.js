var express = require('express'),
    router = express.Router(),
    extend = require('util')._extend,
   mongoose = require('mongoose'), 
   log = require('../modules/logs'),
    security = require('../modules/security'),
    tools = require('../modules/tools'),
    seqs = require('../models/seqs'),
    util = require('util'),
    orders = require('../models/orders'),
    bills = require('../models/bills'),
    async=require('async'), //http://yijiebuyi.com/blog/be234394cd350de16479c583f6f6bcb6.html
    stores = require('../models/stores');
//    router.post('/bills',function(req, res, next) {
  //  res.json({"OK":"OK"});
//})
    router.post('/query',  security.ensureAuthorized,function(req, res, next) {
         var info=req.body;
         log.info('orders',info);
          console.log(info);
         var query={"merchantId":req.token.merchantId}
         if(info.invoiceNo){query.invoiceNo={$regex:query.invoiceNo,$options: "i"}};
         if(info.pickUpTime){
            var startDate=new Date(info.pickUpTime);
            startDate=new Date(startDate.getUTCFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
            query.pickUpTime={"$gte":startDate};
         }
         if(info.pickUpTime){
          var endtDate=new Date(info.pickUpTime);
              endtDate=new Date(endtDate.getUTCFullYear(), endtDate.getMonth(), endtDate.getDate(), 23, 59, 59, 999);
              query.pickUpTime={"$lte":endtDate};
         }   
        // if(info.status){query.status=info.status;}
            var statusChange={
           "!Paid":{$ne:"Paid"},
           "!Semi-Paid":{$ne:"Semi-Paid"},
           "!unpaid":{$ne:"unpaid"},
         }
         if(info.status){
          query.status=statusChange[info.status]?statusChange[info.status]:info.status;
        }
         
         
         if(info.startDate){
            var startDate=new Date(info.startDate);
            startDate=new Date(startDate.getUTCFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
            query.createdAt={"$gte":startDate};
         }
         if(info.endtDate){
          var endtDate=new Date(info.endtDate);
              endtDate=new Date(endtDate.getUTCFullYear(), endtDate.getMonth(), endtDate.getDate(), 23, 59, 59, 999);
              query.createdAt={"$lte":endtDate};
         } 
         var queryArray=[];
         if(info.number){
             queryArray.push({"invoiceNo":{$regex:info.number,$options: "i"}});
             queryArray.push({"customer.phoneNum1":{$regex:info.number,$options: "i"}});
              queryArray.push({"customer.phoneNum2":{$regex:info.number,$options: "i"}});
         }else{
        	queryArray.push({});  
         }

    orders.aggregate([

    {
      $match:query
    }

,
    {
      $project:
      {
     orderNo:1,invoiceNo:1,notes:1,pickUpTime:1,timer:1,merchantId:1,discount:1,discountRate:1,charge:1,chargeRate:1,
    subTotal:1,taxRate:1,tax:1,tip:1,tipTotal:1,orderDetails:1,grandTotal:1,
    reason:1,status:1,createdAt:1,updatedAt:1,createdBy:1,operator:1,customer:1,orderType:1,
    unpaid:{
        $cond: [ { $eq: [ "$status", "Void" ] }, "$grandTotal", "$unpaid" ]
      }
    }
}
,
    {
      $lookup:
        {
          from: "bills",
          localField: "_id",
          foreignField: "order",
          as: "bills"
        }
   },
    {
      $lookup:
        {
          from: "customers",
          localField: "customer.id",
          foreignField: "_id",
          as: "customer"
        }
   },
{
  $unwind:{path:"$customer",preserveNullAndEmptyArrays:true}
},
{
$match:{
 $and:[{"$or":queryArray}]
}
},
{ $sort : { updatedAt : -1, pickUpTime: -1 } }
]).exec(function(err,data){

console.log("======================aaaaaaaaaaaaaa");
console.log(data);
console.log("xxxxxxxxxxxxxxx");
res.json(data);


})


})
/**
[
{_id:xx,min:20}
]
**/
router.post('/updateTimer',  security.ensureAuthorized,function(req, res, next) {
    var info=req.body;
    log.info("updateTime",info);
   var len=info.length;
     for(var i=0;i<len;i++){
         var query={"_id":info[i]._id};
          var timer=tools.defaultDate(),min=info[i].min;
           var update={"timer":null};
              if(min>0){
	         
              timer.setTime(timer.getTime() + min*60*1000);
               update.timer=timer;
     }
         
         orders.findOneAndUpdate(query,update,{},function (err, data) {
               if (err) return next(err);
               if(i>=len){
                res.json(data);  
                }
                
               
        })
     }
})
router.post('/timer',  security.ensureAuthorized,function(req, res, next) {
    var alertDate=tools.defaultDate();

    var query={
      $and:[
           {
             "status":{ "$in":["Unpaid","Paid"]}
           },
            {"timer":{ "$lte":alertDate}  },
           {
	    "timer":{"$ne" : [null] } 
           }
        ]
}
orders.aggregate([
    {
      $match:query
    },
    {
      $lookup:
        {
          from: "bills",
          localField: "_id",
          foreignField: "order",
          as: "bills"
        }
   },
    {
      $lookup:
        {
          from: "customers",
          localField: "customer.id",
          foreignField: "_id",
          as: "customers"
        }
   }
]).exec(function(err,data){
res.json(data);
})
})
router.post('/invoice/:number',  security.ensureAuthorized,function(req, res, next) {
   var info=req.query;
         log.info('orders',info);
         var query={"merchantId":req.token.merchantId}
        
         var number=req.params.number;
    orders.aggregate([
    {
      $match:query
    },
    {
      $lookup:
        {
          from: "bills",
          localField: "_id",
          foreignField: "order",
          as: "bills"
        }
   },
    {
      $lookup:
        {
          from: "customers",
          localField: "customer.id",
          foreignField: "_id",
          as: "customer"
        }
   },
{
  $unwind:{path:"$customer",preserveNullAndEmptyArrays:true}
},
{
  $match:{$and:[{
          $or:[
                      {"invoiceNo":{$regex:number,$options: "i"}},
                      {"customer.phoneNum1":{$regex:number,$options: "i"}},
                       {"customer.phoneNum2":{$regex:number,$options: "i"}},
                     
            ] 
        }]}
},
 { $sort : { updatedAt : -1, pickUpTime: -1 } },
{ $limit : 50 }

]).exec(function(err,data){

console.log("======================aaaaaaaaaaaaaa");
console.log(data);
console.log("xxxxxxxxxxxxxxx");
res.json(data);


})

})
router.post('/refund/:id',security.ensureAuthorized,function(req, res, next) {
       var info=req.body;
           info.merchantId=req.token.merchantId;
           info.status="Refund";
           info.createAt=tools.defaultDate();
           info.updatedAt=tools.defaultDate();
           info.operator={};
           info.operator.id=req.token.id;
           info.operator.user=req.token.user;
           var dao=new bills(info);
           dao.save(function (err, data) {
                 if (err) return next(err);
                  res.json(currentOrderInfo(billData.order));
            })
})
router.post('/bills',security.ensureAuthorized,function(req, res, next) {
       var info=req.body;
       log.info("bills",info);
        var query={"merchantId":req.token.merchantId};
        if(info.status){query.status=info.status;}
       if(info.orderId){query.order=info.orderId};
        bills.find(query).sort({orderNo: 1, _id:1 }).exec(function(err,data){
           if (err) return next(err);
          res.json(data);
        })
})
router.get('/bills',  security.ensureAuthorized,function(req, res, next) {
        var info=req.query;
        log.info("bills",info);
         var query={"merchantId":req.token.merchantId};
        if(info.status){query.status=info.status;}

        bills.find(query).sort({orderNo: 1, _id:1 }).exec(function(err,data){
           if (err) return next(err);
           res.json(data);
        })
})
router.put('/void/:id',  security.ensureAuthorized,function(req, res, next) {
       var query={"_id":req.params.id}
        var info=req.body;
        log.info("void",info);
        var upData={status:"Void"};
            upData.reason=info.reason || "";
        orders.findOneAndUpdate(query,upData,{},function (err, data) {
               if (err) return next(err);
               query={"order":req.params.id};
               info={"status":"Void"};
               bills.update(query,info,{multi:true},function (err, billData) {
                if (err) return next(err);
                 res.json(data);
                })
        })
})
router.put('/billvoid/:id',  security.ensureAuthorized,function(req, res, next) {
	 var query={"_id":req.params.id}
         log.info("billVoid",query);  
        var info={status:"Void"}
        bills.findByIdAndUpdate(req.params.id,info,{},function (err, billData) {
               if (err) return next(err);
               res.json(currentOrderInfo(billData.order));
        
        })
})

router.get('/:id',  security.ensureAuthorized,function(req, res, next) {
        var info=req.query;
         var query={"_id":req.params.id};
                orders.findOne(query).sort({orderNo: 1, _id:1 }).exec(function(err,data){
           if (err) return next(err);
           res.json(data);
        })


})
router.post('/pay',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
   log.info("pay",info);
   info.merchantId=req.token.merchantId; 
   var query={"merchantId":info.merchantId,"name":"orderNo"};
   info.operator={};
   info.operator.id=req.token.id;
   info.operator.user=req.token.user;
   info.createdBy=info.operator;
   if(!!info.customer){delete info.customer};
   info.updatedAt=tools.defaultDate();
   info.status="Unpaid"; //paid ,void
   if(info.pickUpTime){
   
   try{info.pickUpTime=new Date(info.pickUpTime) } catch(ex){}
   }
   if(info._id){
        orders.findOneAndUpdate({"_id":info._id},info,{},function (err, data) {
             if (err) return next(err);
              info.order=orderData._id;
              info.status="Paid";
              delete info["_id"];
              var b=new bills(info);
              b.save(function (err, billData) {
                              if (err) return next(err);
                                 res.json(currentOrderInfo(data._id));
                    })
         
               })
        
    return false;
   }else{
  
   var p1=tools.getNextSequence(query);
   p1.then(function(n){
   info.orderNo=n.seqNo;
    var pre=d.getMonth()+1+""+d.getDate()+(""+d.getFullYear()).substr(2,2);
   info.invoiceNo=pre+n.seqNo;
   var dao = new orders(info);
   dao.save(function (err, data) {
   if (err) return next(err);
      seqs.findOneAndUpdate(query,n.updateData,{},function (err, seqData) {
                   if (err) return next(err);
                         
                          info.order=data._id;
                          info.status="Paid";
                          delete info["_id"];

                          var b=new bills(info);
                           b.save(function (err, billData) {
                              if (err) return next(err);
                              res.json(currentOrderInfo(data._id));
                           })

                  }) 
 });
}, function(n) {
  res.json({"code":"90005"});
});}
})
router.post('/',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
 
   log.info("NewOrder",info);
   var name="orderNo";
   info.merchantId=req.token.merchantId; 
   var query={"merchantId":info.merchantId,"name":name};
   info.operator={};
   info.operator.id=req.token.id;
   info.operator.user=req.token.user;
   info.createdBy=info.operator;
   if(info.pickUpTime){
   try{info.pickUpTime=new Date(info.pickUpTime) } catch(ex){ console.log(ex)}}
  

   var d=tools.defaultDate();
   info.updatedAt=d;
   info.status="Unpaid"; //paid ,void
   info.unpaid=info.grandTotal;
   var p1=tools.getNextSequence(query);
   p1.then(function(n){
   info.orderNo=n.seqNo;
    var pre=d.getMonth()+1+""+d.getDate()+(""+d.getFullYear()).substr(2,2);
   info.invoiceNo=pre+n.seqNo;

   console.log(info);

   var arvind = new orders(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
      seqs.findOneAndUpdate(query,n.updateData,{},function (err, data2) {
                   if (err) return next(err);
                          res.json(data);  
                         
                    }) 
 });
}, function(n) {
  res.json({"code":"90005"});
});
})

router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
     log.info("updateOrder",info);
     info.operator={};
    info.operator.id=req.token.id;
    info.operator.user=req.token.user;
    info.updatedAt=tools.defaultDate();
    info.status="Unpaid";
    var query={"_id":req.params.id};
    var options = {new: true};
 console.log("==========================");
console.log(req.params.id);
console.log("===============");   
  if(info.pickUpTime){
   try{info.pickUpTime=new Date(info.pickUpTime) } catch(ex){}}
info.unpaid=info.grandTotal;
         bills.aggregate([
                               { $match: { "order":mongoose.Types.ObjectId(req.params.id),"status":"Paid" } },
                               {
                                $project:
                                {
                                   order:1,receiveTotal:1,tip:1,
                                   change:{$cond: [ { $gte: [ "$change", 0 ] }, "$change", 0 ]}
                                }
                               },
                               {  $group: {
                                  _id: "$order",
                                  receiveTotal: { $sum: "$receiveTotal" } ,
                                  change: { $sum:"$change"}   ,
                                  tip: { $sum: "$tip" } ,

                                }
                               }


                           ]).exec(function(err,billData){
                              if (err) return next(err);
                               console.log(billData);
              
                               var billData=billData[0];
                               if(billData){
                               console.log("=================AAA=================");
                                   var orderQuery={"_id":billData.order};
                                   var unpaid=toFixed(info.grandTotal-(billData.receiveTotal-billData.change-billData.tip),2);
                                   info.status="Paid";
                                    if(unpaid>0){
                                    info.status="Semi-Paid";

                                   }
                                    info.unpaid=unpaid==0?-billData.change:unpaid;
                                  }
                                   console.log(info);

                                                        orders.findOneAndUpdate(query,info,options,function (err, orderData) {
                                             if (err) return next(err);

                                             res.json(orderData);
                                    })
 })

})                           
    
router.post('/report',  function(req, res, next) {


   var info=req.body;
   var query={};
if( info.staffId){
   query["operator"]={"id":info.staffId};
 }    
if(info.startTime){
           var startTime=new Date(info.startTime);
           if(info.startTime.length<=12){
           startTime= new Date(startTime.getUTCFullYear(),startTime.getMonth(),startTime.getDate(), -5, 0, 0, 0);
           }
           startTime=tools.miniteFromNow(startTime,24);  
           query["createdAt"]={"$gte":startTime};  
        }
        if(info.endTime){
           var endTime=new Date(info.endTime);
          
           if(info.endTime.length<=12){
           endTime= new Date(endTime.getUTCFullYear(),endTime.getMonth(),endTime.getDate(),18, 59, 59, 999);
           }
            endTime=tools.miniteFromNow(endTime,24);
            if(query["createdAt"]){
           query["createdAt"]["$lte"]=endTime; 
           }else{
            query["createdAt"]={"$lte":endTime};
            }

        } 
if(!info.detail){
async.parallel({
    one: function (done) {
      var initData={
      "grandTotal":0,
      "subTotal": 0,
      "taxTotal": 0,
      "ofOrder": 0,
      "discountTotal": 0,
      "chargeTotal": 0,
      "tipTotal": 0,
     "voidGrandTotal":0,
      "ofVoid":0
   
   
        }
     
        orders.aggregate([
            {
              $match:query
            },
             { $group: { _id: "$status", grandTotal: { $sum: "$grandTotal" },subTotal: { $sum: "$subTotal" },taxTotal: { $sum: "$tax" },ofOrder: { $sum:1 },
              discountTotal: { $sum:"$discount"},chargeTotal: { $sum:"$charge" },tipTotal:{$sum:"$tip"}
              } }]).exec(function(err,data){
                 if (err) return next(err);
                 data.forEach(function(v,k){
                    if(v._id=="Void"){
                      initData.voidGrandTotal=v.grandTotal.toFixed(2);
                      initData.ofVoid=v.ofOrder;
                     }else{
                      initData.grandTotal+=v.grandTotal;
                      initData.subTotal+=v.subTotal;
                      initData.taxTotal+=v.taxTotal;
                      initData.ofOrder+=v.ofOrder;
                      initData.discountTotal+=v.discountTotal;
                      initData.chargeTotal+=v.chargeTotal;
                      initData.tipTotal+=v.tipTotal;
                      }
                 })
                  initData.grandTotal=initData.grandTotal.toFixed(2);
                  initData.subTotal=initData.subTotal.toFixed(2);
                  initData.taxTotal=initData.taxTotal.toFixed(2);
                  initData.discountTotal=initData.discountTotal.toFixed(2);
                 initData.chargeTotal=initData.chargeTotal.toFixed(2);
                 initData.tipTotal=initData.tipTotal.toFixed(2);
                
                 done(null,initData);
             })
             
    },
    two: function (done) {  //Laundry + Merchandise = Grand Total
          var initData={};
          var twoQuery=query;
          twoQuery["status"] ={$ne:"Void"};
         console.log(twoQuery);
		orders.aggregate([
            {
              $match:twoQuery
            },
             { $group: { _id: "$orderType", grandTotal: { $sum: "$grandTotal" }
              }} ]).exec(function(err,data){
                 if (err) return next(err);
                    data.forEach(function(v,k){
                       var key=v._id || "laundry";
                      initData[key]=v.grandTotal;
                      //initData.orders=initData.orders.concat(v.orders || []);
                   })
                  done(null,initData);
             })
    },
    three: function (done) {  //Paid Total = Cash + Credit + Gift Card + Loyalty
          var initData={};
          var threeQuery=query;
           threeQuery["status"] ={$ne:"Void"};

          orders.aggregate([
            {
              $match:threeQuery
            },
            {
              $unwind:"$orderDetails"
            },
           

             { $group: { _id: null, discountTotal: { $sum: "$orderDetails.discount" },chargeTotal:{ $sum: "$orderDetails.charge" }
              }} ]).exec(function(err,data){
                 if (err) return next(err);
                    data.forEach(function(v,k){
                      
                      initData["discountTotal"]=v.discountTotal;
                      initData["chargeTotal"]=v.chargeTotal;
                      //initData.orders=initData.orders.concat(v.orders || []);
                   })
                  done(null,initData);
             })
       
    },
    four: function (done) {  //Paid Total = Cash + Credit + Gift Card + Loyalty
          var initData={};
          var fourQuery=query;
             fourQuery["status"]="Paid";
            console.log(fourQuery);
          bills.aggregate([
            {
              $match:fourQuery
            },
             { $group: { _id: "$type", receiveTotal: { $sum: "$receiveTotal" },change:{$sum:
              { $cond: { if: { $gte: [ "$change", 0 ] }, then: "$change", else:0 }}
             }
              } }]).exec(function(err,data){
                 if (err) return next(err);
                    data.forEach(function(v,k){
                       var key=v._id  || "other";
                       initData[key]=(v.receiveTotal-v.change).toFixed(2);
                      // initData.orders=initData.orders.concat(v.orders || [] );   
                    })
                    
                     done(null,initData);
             })
       
    }
}, function (err, result) {
    if(!!err){console.log(err); return next(err)}
    var returnJson={};
   result.one.discountTotal=parseFloat(result.one.discountTotal);
  result.one.chargeTotal=parseFloat(result.one.chargeTotal); 
  result.one.discountTotal+=(result.three.discountTotal || 0);
   result.one.chargeTotal+=(result.three.chargeTotal || 0);
   returnJson=tools.mergeJson(returnJson,result.one);
  returnJson=tools.mergeJson(returnJson,result.two);
 returnJson=tools.mergeJson(returnJson,result.four);
//   returnJson.two=result.two;
 //  returnJson.four=result.four;
    res.json(returnJson)
})
}else{
  var q=query;
  var sign="A";
   switch (info.detail)
{
    case "GRAND_TOTAL":
         q["grandTotal"]={$gt:0};q["status"] ={$ne:"Void"};break;
    case "SUBTOTAL":
         q["subTotal"]={$gt:0}; q["status"] ={$ne:"Void"};break;
    case "TAXTOTAL":
         q["taxTotal"]={$gt:0}; q["status"] ={$ne:"Void"};break;
    case "OF_ORDER":
         q["status"] ={$ne:"Void"};break;
    case "VOID_GRAND_TOTAL":
          q["grandTotal"]={$gt:0};q["status"]="Void";break;
    case "TIP_TOTAL":
          q["tip"]={$gt:0}; q["status"] ={$ne:"Void"};break;

    case "OF_VOID":
        q["status"]="Void";break;
    case "LAUNDRY":
        q["status"]={$ne:"Void"};q["orderType"]="Laundry";break;
    case "MERCHANDISE":  
    q["status"]={$ne:"Void"};q["orderType"]="Merchandise";break;
    
    //------------------------------
    case "DISCOUNT_TOTAL":
        sign="B";
        query["status"]={$ne:"Void"};
 
       // var qq=JSON.parse(JSON.stringify(query));
          q={$and:[query,{
                  $or:[{"discount":{$gt:0}},{"orderDetails.discount":{$gt:0}}]}	 
            ] };
            break;
    case "CHARGE_TOTAL":
         sign="B";
        // var qq=JSON.parse(JSON.stringify(query));
          q={$and:[query,{$or:[{"charge":{$gt:0}},{"orderDetails.charge":{$gt:0}}]}]};break;
      //-----------------------    
   case "CASH":
         sign="C";
           // q["status"]="Paid";
        break;
   case "CREDIT":
          sign="C";
          break;
   default:
       sign="D";
       break;     
         }

         if(sign=="A"){
            orders.aggregate([
             {
               $match:q
             }
             ]).exec(function(err,data){
                   if (err) return next(err);

                  return res.json(data);    
              })
         }else if(sign=="B"){
          var changeSatus={
           "DISCOUNT_TOTAL":"discount","CHARGE_TOTAL":"charge"
         }
           orders.aggregate([
             {
               $match:q
             }
             ]).exec(function(err,data){
                  if (err) return next(err);
                  var tempData=[];
                  if(data){
                  
                  tempData= JSON.parse(JSON.stringify(data)); }
                  for(var i=0;i<tempData.length;i++){
                         for(var j=0;j<tempData[i].orderDetails.length;j++){
                             tempData[i][changeSatus[info.detail]]+=tempData[i].orderDetails[j][changeSatus[info.detail]] || 0;
                             
                         }
                  }
                  return res.json(tempData);    
              })

         }else if(sign=="C"){
         var changeStatus={
           "CASH":"Cash","CREDIT":"Credit"
         }
         console.log(q);
          orders.aggregate([
             {
               $match:q
             },
             {
   $lookup:
     {
       from: "bills",
       localField: "_id",
       foreignField: "order",
       as:"billDocs"
     }
}
,
{
$match:{"billDocs.status":"Paid","billDocs.type":changeStatus[info.detail]}
}
             ]).exec(function(err,data){
             
               console.log(data);
             console.log({"billDocs.type":"Paid","billDocs.status":changeStatus[info.detail]});
                   if (err) return next(err);
                var returnData=[];
                 if(data){
                   returnData=JSON.parse(JSON.stringify(data));
                 }
                  for(var i=0;i<returnData.length;i++){
                          returnData[i]["paid"]=0;
                         for(var j=0;j<returnData[i].billDocs.length;j++){
                             returnData[i]["paid"]+=(returnData[i].billDocs[j].receiveTotal - returnData[i].billDocs[j].change) || 0;
                             
                         }
                  }
                  return res.json(returnData);    
              })
          

         }else{
           
          return next({"code":"90010"});
         }
          


}

function currentOrderInfo(orderId,payType){
         var payTypeStatus={
               "CASH":"Cash","CREDIT":"Credit"
          }
          var query={
             $match:{"billDocs.status":{$ne:"Void"}}
          }
          if(!!payType){
            query["billDocs.type"]=payTypeStatus[payType]
          }

        orders.aggregate([
                 {
                   $match:{"orderId":orderId}
                 },
                 {
             $lookup:
             {
             from: "bills",
             localField: "_id",
             foreignField: "order",
             as:"billDocs"
          }
        }
        ,query,
        {
          $unwind:"$billDocs"
        },
        {
          $group:{
                "_id":"$_id",
                 grandTotal:{$first:"$grandTotal"},
                 receiveTotal:{$sum:"$billDocs.receiveTotal"},
                 change:{$sum:{ $cond: { if: { $eq: [ "$billDocs.status", "Paid" ] }, then: 
                 { $cond: { if: { $gte: [ "$billDocs.change", 0 ] }, then: "$billDocs.change", else:0 }}
                 , else:0
                 
                  }}},
                  refund:{$sum:{ $cond: { if: { $eq: [ "$billDocs.status", "Refund" ] }, then: 
                 { $cond: { if: { $gte: [ "$billDocs.change", 0 ] }, then: "$billDocs.change", else:0 }}
                 , else:0
                 }}},
                 bill:{$first:"$billDocs.bill"},
                 tax:{$first:"$tax"},
                 tip:{$first:"$tip"},
                 charge:{$first:"$charge"},
                 orderNo:{$first:"$orderNo"},
                 invoiceNo:{$first:"$invoiceNo"},
                 notes:{$first:"$notes"},
                 pickUpTime:{$first:"$pickUpTime"},
                 timer:{$first:"$timer"},
                 merchantId:{$first:"$merchantId"},
                 subTotal:{$first:"$subTotal"},
                 orderType:{$first:"$orderType"},
                 orderDetails:{$first:"$orderDetails"},
                 customer:{$first:"$customer"},
                 reason:{$first:"$reason"},
                 discount:{$first:"$discount"}
          }
        },
        {
         $addFields: {
           unpaid:{$sum:["$grandTotal","$change",-"$receiveTotal"]}}
          }
         ,
         {
         $addFields: {
           status:{ $cond: { if: { $gte: [ "$unpaid", "$grandTotal" ] }, then:"Unpaid", else: 
            {$cond: { if: { $gte: [ "$unpaid", 0 ] }, then: "Paid", else: "Semi-Paid" }}
            } }}
           
         }
         ,
        ]).exec(function(err,data){
              if (err) return next(err);
              var newJson={
                refund:data.refund,status:data.status,unpaid:data.unpaid,
              }
        orders.findByIdAndUpdate(data._id,newJson,{},function (err, orderData) {
               if (err) return next(err);
               return data;
                
               
        })
              

    })
  }
/*var changeJson={};

  changeJson["GRAND_TOTAL"]={"grandTotal":{"$gt":0}};
  changeJson["SUBTOTAL":subTotal,
  changeJson"TAXTOTAL":taxTotal,
  changeJson"OF_ORDER":grandTotal,
  changeJson"DICOUNT_TOTAL":discount,
  changeJson"CHANGE_TOTAL":charge,
   changeJson"TIP_TOTAL":tip,
   "Merchandise":grandTotal,
    "LAUNDRY":grandTotal,
     "CASH":grandTotal,
     "CREDIT":grandTotal,
}
}*/
//
//GRAND_TOTAL,SUBTOTAL,TAXTOTAL,OF_ORDER,

  /*  "grandTotal": "30.37",
    "subTotal": "30.00",
    "taxTotal": "0.37",
    "OfOrder": 4,
    "discountTotal": "0.00",
    "chargeTotal": "0.00",
    "tipTotal": "0.00",
     "Merchandise": 54,
     "Laundry": 81.74000000000001

    "Cash": "96.37"
     "CREDIT":xx
    不等于VOID，大于>


    "voidGrandTotal": "105.37",
    "OfVoid": 9,
    等于VOID，大于>

=================
    "voidItemTotal": 0,
    "voidItemDiscountTotal": 0,
    "voidItemChargeTotal": 0,*/













})

module.exports = router;

var toFixed=function(num, s) {                        //00003
          var tempnum = num.toFixed(s+4);
      return Number(Math.round(tempnum+'e'+s)+'e-'+s);
}
