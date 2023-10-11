const mongoose = require("mongoose");

const {Schema} = mongoose;

const commentSchema = new Schema({
    content: {type:String, required:true},
    blog: {type: mongoose.SchemaTypes.ObjectId, ref: 'Blog'}, //ref = model name
    author: {type: mongoose.SchemaTypes.ObjectId, ref:'User'}
},
    {timestamps:true}
);
// module.exports.module('Comment' , commentSchema , 'comments');
module.exports = mongoose.model('Comment', commentSchema, 'comments');
