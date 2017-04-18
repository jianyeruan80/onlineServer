var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var licensesHistorysSchema = new mongoose.Schema({ 
    licenseKey:{type:String},
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user:String
    },
    merchantId:String,
    month:{type:Number,default:3},
    active:{type:Boolean,default:false} ,
    startDate:Date,
    expires:Date,
    license:{type: mongoose.Schema.Types.ObjectId, ref: 'licenses' },
    
});




licensesHistorysSchema.index({merchantId: 1 }, { unique: true,sparse:true});
module.exports = mongoose.model('licensesHistorys', licensesHistorysSchema);