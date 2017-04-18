/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
    "second":String,
    "third":String
})
var globalOptionsSchema = new mongoose.Schema({ 
    merchantId:{type:String,upperase: true, trim: true},
    group:{type: "String",default:"Default"},
    name:{type: "String"},
    price:{type:Number,default:0},
    description:String,
    minimun:{type:Number,default:0},
    maximun:{type:Number,default:0},
    order:{type:Number,default:1},
    picture:{type:String,default:'img/default.png'},
    language:{
         group:lauguagesSchema,
         name:lauguagesSchema,
         description:lauguagesSchema
    }
   
});
globalOptionsSchema.index({ merchantId: 1,name:1,group:1},{unique: true,sparse:true });


var optionsSchema = new mongoose.Schema({ 
    merchantId:{type:String,trim: true},
    group:{type:String ,default:"Default"},
    name:{type:String},
    price:{type:Number,default:0},
    description:String,
    minimun:{type:Number,default:0},
    maximun:{type:Number,default:0},
    order:{type:Number,default:1},
    picture:{type:String,default:'img/default.png'},
    status:{type:Boolean,default:true},
    language:{
         group:lauguagesSchema,
         name:lauguagesSchema,
         description:lauguagesSchema
    }
});

var groupsSchema = new mongoose.Schema({ 
    merchantId:{type:String,uppercase: true, trim: true},
    name:{type:String},
    description:String,
    status:{type:Boolean,default:true},
    order:{type:Number,default:1},
    orderTime:String,
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    },
    picture:{type:String,default:'img/default.png'},
    categorys:[{type: mongoose.Schema.Types.ObjectId, ref: 'categorys'}]
   
});
groupsSchema.index({ name: 1, merchantId: 1 }, { unique: true,sparse:true});

var categorysSchema = new mongoose.Schema({
    merchantId:{type:String,uppercase: true},
    name:{type:String},
    group:{ type: mongoose.Schema.Types.ObjectId, ref: 'groups',null: true },
    options:[optionsSchema],
    description:String,
    status:{type:Boolean,default:true},
    order:{type:Number,default:1},
    picture:{type:String,default:'img/default.png'},
    items:[{type: mongoose.Schema.Types.ObjectId, ref: 'items'}],
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
});

categorysSchema.index({ name: 1, merchantId: 1 }, { unique: true,sparse:true});
var propertiesSchema = new mongoose.Schema({ 
    name:String,
    value:{type:Boolean,default:false},
    language:{
         name:lauguagesSchema
   }
});
var itemsSchema = new mongoose.Schema({ 
    merchantId:{type:String,default:"",uppercase: true, trim: true},
    name:{type:String},
    options:[optionsSchema],
    status:{type:Boolean,default:false},
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'categorys',null: true },
    price:Number,
    picture:{type:String,default:'img/default.png'},
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



module.exports.globalOptions = mongoose.model('globalOptions', globalOptionsSchema);
module.exports.groups = mongoose.model('groups', groupsSchema);
module.exports.categorys = mongoose.model('categorys', categorysSchema);
module.exports.items = mongoose.model('items', itemsSchema);

*/