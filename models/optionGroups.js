var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
    "second":String,
    "third":String
})

var optionsSchema = new mongoose.Schema({ 
    name:String,
    description:String,
    price:Number,
    order:{type:Number,default:1},
    picture:String,
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
   
});

var optionGroupsSchema = new mongoose.Schema({ 
    merchantId:{type:String,upperase: true, trim: true},
    group:{type: "String",default:"Default"},
    description:String,
    minimun:{type:Number,default:0},
    maximun:{type:Number,default:0},
    order:{type:Number,default:1},
    picture:String,
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user:String
},
    options:[optionsSchema],
    language:{
         group:lauguagesSchema,
        
         description:lauguagesSchema
    }
   
});
optionGroupsSchema.index({merchantId: 1,group:1},{unique: true,sparse:true });
module.exports = mongoose.model('optionGroups', optionGroupsSchema);

