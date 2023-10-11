class BlogDTO{
    constructor(blog){
        this._id = blog._id;
        this.author = blog.author;
        this.content= blog.content;
        this.title= blog.content;
        this.photo = blog.photoPath
    }
}module.exports = BlogDTO;