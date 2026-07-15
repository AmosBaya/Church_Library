const mongoose = require('mongoose');

// will add phone number

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        unique:true,
        required:true
    },
    role:{
        type:String,
        enum:['user','manager','admin'],
        default:'user',
    },
},
{
    timestamps:true
}
);

module.exports=mongoose.model('User', userSchema);