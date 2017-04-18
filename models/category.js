var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
	"second":String,
	"third":String
})
var categorysSchema = new mongoose.Schema({
    merchantId:{type:String,uppercase: true},
    name:{type:String},
    group:{ type: mongoose.Schema.Types.ObjectId, ref: 'groups',null: true },
    options:[optionsSchema],
    description:String,
    status:{type:Boolean,default:true},
    order:{type:Number,default:1},
    picture:{type:String},
    //items:[{type: mongoose.Schema.Types.ObjectId, ref: 'items'}],
    operator:String,
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
});

categorysSchema.index({ name: 1, merchantId: 1 }, { unique: true,sparse:true});

/*{ createdAt: { type: Date, expires: 3600, default: Date.now }}
OrderList.$.UserName","大叔2015-09-21
*/