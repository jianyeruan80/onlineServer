var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressSchema = new Schema({
      address: String,
      city: String,
      state: String,
      zipcode: String,
      description:String
});
var historysSchema = new mongoose.Schema({ 
    licenseKey:String,
    sessionKey:[],
    merchantId:String,
    email:String,
    phone:String,
    contact:String,
    storeName:String,
    addressInfo:addressSchema,
    description:String,
    activeKey:String,
    pcKey:String,
    count:Number,
    month:Number,
    createdAt:Date,
    delay:{type:Number,default:7},
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
     user:String
    },
    startDate:Date,
    expires:Date,
    type:{type: String, enum: ['Normal', 'Trial'],default:'Normal'},
  })
var licensesSchema = new mongoose.Schema({ 
    licenseKey:String,
    merchantId:String,
    email:String,
    phone:String,
    contact:String,
    storeName:String,
    addressInfo:addressSchema,
    description:String,
    activeKey:String,
    pcKey:String,
    count:Number,
    month:Number,
    createdAt:Date,
    delay:{type:Number,default:7},
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
     user:String
    },
    startDate:Date,
    expires:Date,
    type:{type: String, enum: ['Normal', 'Trial'],default:'Normal'},
   
    histories:[]
    
 });

licensesSchema.index({merchantId:1}, { unique: true,sparse:true});
module.exports = mongoose.model('licenses', licensesSchema);