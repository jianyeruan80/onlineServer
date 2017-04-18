var mongoose = require('mongoose'),Schema = mongoose.Schema;

var orderDetailsSchema = new Schema({

order:{type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
category:String,
price:Number,
qty:Number,
name:String,
currentPrice:Number,//-
discount:Number,//-
discountRate:Number,//-
qty:Number,
options:[],
properties:[],
createdAt: {type:Date,default:Date.now},
updatedAt: Date,
item:{type: mongoose.Schema.Types.ObjectId, ref: 'items' },
order:{type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
operator:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	user:String
},
});


module.exports = mongoose.model('orderDetails', orderDetailsSchema);

/*  yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          time: { $dateToString: { format: "%H:%M:%S:%L", date: "$date" } }
{ "_id" : 1, "yearMonthDay" : "2014-01-01", "time" : "08:15:39:736" }
          */
/*
           detail.category=orderDetails[i].category;
            detail.price=orderDetails[i].price;
            detail.qty=orderDetails[i].qty;
            detail.name=orderDetails[i].name;
            detail.currentPrice=orderDetails[i].currentPrice;
            detail.discount=orderDetails[i].discount?orderDetails[i].discount:0;
            detail.discountRate=orderDetails[i].discountRate?orderDetails[i].discountRate:0;
            detail.properties=orderDetails[i].properties;
            detail.item=orderDetails[i]._id;
            detail.options=orderDetails[i].options;
            details.push(detail);*/