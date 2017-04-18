var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
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
      language:{
         description:lauguagesSchema
    },
    location: {
    type:{type:String,default:'Point'},
    coordinates: [Number],
    
  }
  
});
var distanceFeeSchema = new mongoose.Schema({ 
  distance:String,
  fee:Number
})
/*licenseKeyFeeSchema = new mongoose.Schema({ 
  pcKey:String,
  value:String
})*/
var storesSchema = new mongoose.Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    name:String,
    contact:String,
    addressInfo:addressSchema,
    phoneNum1:String,
    phoneNum2:String,
    webSite:String,
    email:String,
    password:String,
    tax:Number,
    about :String,
    createdAt: {type:Date,default:Date.now()},
    updatedAt: Date,
    logo:String,
    fax:String,
    /*licenseKey:[licenseKeyFeeSchema],*/
    openTime:String,
    orderTime:String,
    qrcUrl:{type:String,lowercase:true},
    minPrice:Number,
    waitTime:String,
    deliveryFee:String,
    maxDistance:Number,
    DiffTimes:{type:Number,default:0},
    distanceFee:[distanceFeeSchema],
    expires:Date,
    reportStartTime:Date,
    reportEndTime:Date,
    status:{type:String,default:"true"},
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    },
    zoneInfo:{type:Number,default:0},
    chains:String,
    operator:{
  id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  user:String,

},
});
//storesSchema.index({qrcUrl:1},{unique: true,sparse:true });
addressSchema.index({location:'2dsphere'})
storesSchema.index({merchantId:1,qrcUrl:1},{unique: true,sparse:true });
module.exports = mongoose.model('stores', storesSchema);

