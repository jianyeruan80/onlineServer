var mongoose = require('mongoose');
    Schema = mongoose.Schema,
     tools = require('../modules/tools');
var lauguagesSchema = new Schema({
    "second":String,
    "third":String
})

var addressSchema = new Schema({
      address: String,
      city: String,
      state: String,
      zipcode: String,
      description:String,
      updatedAt: Date,
      location: {
      type:{type:String,default:'Point'},
      coordinates: [Number],
      }
});
var creditCardsSchema=new Schema({
   cardNo:String,
   holderName:String,
   expirationYear:String,
   expirationMonth:String,
   ccv:String,
   cardType:String,
   updatedAt: Date,

})

var customersSchema = new mongoose.Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    account:String,
    firstName:String,
  	lastName:String,
	  birthDay:Date,
	  addressInfo:[addressSchema],
	  phoneNum1:{type:String,trim: true, index: true, required: true},
	  phoneNum2:String,
	  email:{type:String,lowercase:true},
    password:String,
    creditCard:[creditCardsSchema],
    token:String,
	  facebook:String,
  	wechat:String,
	  twitter:String,
	  password:String,
    fax:String,
  	createdAt: {type:Date,default:Date.now()},
    updatedAt: Date,
    description:String,
    status:{type:String, default: "true"},
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user:String
    },
    memberships:[{type: mongoose.Schema.Types.ObjectId, ref: 'memberships'}],
     language:{
         description:lauguagesSchema
    },
});
addressSchema.index({location:'2dsphere'})
customersSchema.index({ email: 1 ,status:1}, { unique: true,sparse:true });

module.exports = mongoose.model('customers', customersSchema);

