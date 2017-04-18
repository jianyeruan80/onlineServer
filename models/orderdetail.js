var mongoose = require('mongoose'),Schema = mongoose.Schema;

var orderDetailsSchema = new Schema({

order:{type: mongoose.Schema.Types.ObjectId, ref: 'orders' },

groupName:String,
categoryName:String,
itemName:String,
itemPrice:Number,
discountRate:Number,
discountTotal:Number,
orderDiscountStatus:{type:Boolean,default:true},
qty:Number,
options:[
	{name:String,price:Number}
],
createdAt: {type:Date,default:Date.now},
updatedAt: Date,
createdBy:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	user:String
},
operator:{
  id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },

});

module.exports = mongoose.model('orderDetails', orderDetailsSchema);

/*  yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          time: { $dateToString: { format: "%H:%M:%S:%L", date: "$date" } }
{ "_id" : 1, "yearMonthDay" : "2014-01-01", "time" : "08:15:39:736" }
          */