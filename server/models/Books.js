const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    author:{
        type:String,
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    summary:{
        type:String,
        trim:true
    },
    totalCopies:{
        type:Number,
        min:0,
        default:1,
        required:true
    },
    availableCopies:{
        type:Number,
        min:0,
        default:1,
        required:true
    },
    status:{
        type:String,
        enum:["available", "not available"],
        default:"available",
    },
    coverImages:{
        type:[String],
        required:true
    }
});

module.exports=mongoose.model("Book", bookSchema);