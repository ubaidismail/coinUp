const mongoose = require("mongoose");
const {Schema} = mongoose;
const User = require('../models/user')

const blogSchema = new Schema({
    title: {type: String, requied: true},
    content: {type: String, required:true},
    photoPath: {type:String, required:true},
    author: {type:mongoose.SchemaTypes.ObjectId, ref:'User'}
},
    {timestamps:true}
) 

module.exports = mongoose.model('Blog' , blogSchema , 'blogs' );

