var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
    "second":String,
    "third":String
})
var optionsGroupsSchema = new mongoose.Schema({ 
    name:String,
    description:String,
    price:Number,
    order:{type:Number,default:1},
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
   
});

globalOptionsSchema.index({ merchantId: 1,group:1},{unique: true,sparse:true });
module.exports = mongoose.model('optionsGroups', optionsGroupsSchema);

