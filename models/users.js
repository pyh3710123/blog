var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var userSchema = new Schema({
    username: {type: String},
    realname: {type: String},
    hashed_password: {type: String, required: true},
    age: {type: Number},
    email:{type:String},
    picture: {type: String},
    gender: {type: Number},
    nicname: {type: String},
    /*address: {type: String},*/
    phone: {type: Number,unique:true,required:true},
    createdAt: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema);
module.exports = User;