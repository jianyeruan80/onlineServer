var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
	"second":String,
	"third":String
})
var sizesSchema = new mongoose.Schema({ 
      name:String,
      price:Number,
       language:{
         name:lauguagesSchema,
        
    }
})
var itemsSchema = new mongoose.Schema({ 
    merchantId:{type:String,uppercase: true, trim: true},
    name:{type:String},
    options:[optionsSchema],
    size:[sizesSchema]
    status:{type:Boolean,default:false},
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'categorys',null: true },
    price:Number,
    picture:{type:String},
    status:{type:Boolean,default:true},
    description:String,
    order:{type:Number,default:1},
    oldPrice:Number,
    recommend:{type:Boolean,default:false},
    properties:[propertiesSchema],
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
});
itemsSchema.index({ name: 1, merchantId: 1 }, { unique: true,sparse:true});

/*{ createdAt: { type: Date, expires: 3600, default: Date.now }}
OrderList.$.UserName","大叔2015-09-21
*/