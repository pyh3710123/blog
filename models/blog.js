var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var blogSchema = new Schema({
    title: {type: String},
    content: {type: String},
    author_id: {type: String},
    like:{type:Number},
    hate:{type:Number},
    comment:{type:Number},
    commentText:{type:Array},
    createdAt: {type: Date, default: Date.now}
});
var Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;