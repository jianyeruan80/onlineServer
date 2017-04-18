  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var permissionsSchema = new Schema({ 
  permissionGroup: {type:String},
  subject: {type:String},
  action: {type:String},
  perm:Number,
  order:{type:Number,default:1},
  url:String,
  status:{type:String ,default:"true"},
  description:String,
  createdAt: {type:Date,default:Date.now()},
  updatedAt: Date
});
var rolesSchema = new Schema({
   name: {type:String},
   description:String,
   permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'permissions' }],
   order:{type:Number,default:1},
   status:{type:String ,default:"true"},
   merchantId:{type:String,lowercase: true, trim: true},
   createdAt: {type:Date,default:Date.now()},
   updatedAt: Date,
  operator:{
  id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  user:String
},
});
var addressSchema = new Schema({
      address: {type:String,deflaut:""},
      city: String,
      state: String,
      zipCode: String,
      description:String
});
var usersSchema = new Schema({
   userName:{type:String,lowercase: true, trim: true},
   password:String,
   description:String,
   merchantId:{type:String,lowercase: true, trim: true},
   merchantIds:{type:String,lowercase: true, trim: true},//一用户看多店
   permissions:[{type: Schema.Types.ObjectId, ref: 'permissions' }],
   roles:[{ type:Schema.Types.ObjectId, ref: 'roles' }],
   defaultPerm:{type:Number,default:1},
   firstName:String,
   middleName:String,
   lastName:String,
   email:{type:String,lowercase: true, trim: true},
   phoneNum1:String,
   phoneNum2:String,
   birthday: Date, 
   addressInfo:addressSchema,
   token:[{type:String}], //2支拉二三个记住密码
   type:{type:String,default:""},//super,admin,"normal"
   status:{type:String,default:"true"},
   createdAt: {type:Date,default:Date.now()},
   updatedAt: Date,
   storeName:String,
   token:String,
   operator:{
   id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
   user:String},
});
permissionsSchema.index({ permissionGroup: 1 ,subject:1,action:1}, { unique: true,sparse:true });
rolesSchema.index({ name: 1 ,merchantId:1,status:1}, { unique: true,sparse:true });
usersSchema.index({userName: 1 ,merchantId:1,status:1,type:1}, { unique: true,sparse:true });
module.exports.permissions = mongoose.model('permissions', permissionsSchema);
module.exports.roles = mongoose.model('roles', rolesSchema);
module.exports.users = mongoose.model('users', usersSchema);
