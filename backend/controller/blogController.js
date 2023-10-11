const Joi = require("joi");
const fs = require('fs');
const Blog = require('../models/blog');
const { BACKEND_SERVER_PATH } = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-detailsDTO');
const Comment = require('../models/comment');

const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
    async create(req, res, next) {
        // ## validate req body
        // handle photo storage 
        // add to db
        // return response

        // pphoto client side => base64 encoded string -> decode in backend -> store  -> save photo path or filename in db 
        const createBlogScehema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()

        })
        const { error } = createBlogScehema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { title, author, content, photo } = req.body;

        // read buffer for image
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        // alot a random name

        const imagePath = `${Date.now()}-${author}.png`;

        // save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);

        }
        // save in blog db;
        let newBlog;

        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            })
            await newBlog.save();
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDTO(newBlog);

        res.status(201).json({ blog: blogDto });
    },
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({});
            const blogsDTO = [];
            for (let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i]);
                blogsDTO.push(dto);
            }
            return res.status(200).json({ blogs: blogsDTO });
        } catch (error) {
            return next(error);
        }
    },
    async getById(req, res, next) {
        // validate id
        // response 

        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoDbIdPattern).required(),
        });
        const { error } = getByIdSchema.validate(req.params);

        if (error) {
            return next(error);
        }

        let blog;
        const { id } = req.params;
        try {
            blog = await Blog.findOne({ _id: id }).populate('author');

        } catch (error) {
            return next(error);
        }
        const DetailsDTO = new BlogDetailsDTO(blog);
        return res.status(200).json({ blog: DetailsDTO });
    },
    async update(req, res, next) {
        // validation
        const updateBlogScehema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            blogId: Joi.string().regex(mongoDbIdPattern).required(),
            photo: Joi.string()

        })
        const { error } = updateBlogScehema.validate(req.body);
        const { title, content, author, blogId, photo } = req.body;

        // delete previoius photot
        // save new photo
        let blog;

        try {
            blog = await Blog.findOne({ _id: blogId });
        } catch (error) {
            return next(error);
        }
        // if photo field is null then it means we are not updating photo

        if (photo) {
            let previoudPhoto = blog.photoPath;
            previoudPhoto = previoudPhoto.split('/').at(-1); // 1234234213.png

            //   delete photot

            fa.unlinkSync(`storage/${previoudPhoto}`);

            // now update with new photo

            // read buffer for image
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

            // alot a random name

            const imagePath = `${Date.now()}-${author}.png`;

            // save locally
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);

            }
            await Blog.updateOne({_id:blogId}, 
                {title,content, photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`} //fields to update
                );
        }else{
            // if need to update title and contentn only 
            await Blog.updateOne({_id:blogId}, {title,content});
        }
        return res.status(200).json({message: 'Blog Updated'});
    },
    async delete(req, res, next) {  
        // validate
        // delete blog
        // delete comments on this blog
        const deleteblogSchema = Joi.object({
            id:Joi.string().regex(mongoDbIdPattern).required(),
        })
        const {error} = deleteblogSchema.validate(req.params);
        const {id} = req.params;
        // delete blog
        // delete comments
        try {

            await Blog.deleteOne({_id:id});

            await Comment.deleteMany({blog:id});
        
        } catch (error) {
            return next(error);
        }
        return res.status(200).json({message:'Blog Deleted'});
    },
};


module.exports = blogController;    