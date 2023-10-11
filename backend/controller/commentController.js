const Joi = require("joi");
const Comment = require('../models/comment');
const CommentDTO = require('../dto/comment');

const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {
    async create(req, res, next) {
        const createCommentScehema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            blog: Joi.string().regex(mongoDbIdPattern).required(),

        })
        const { error } = createCommentScehema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { content, author, blog } = req.body;

        try {

            const newComment =  new Comment({content,author,blog});
            await newComment.save();
            
        } catch (error) {
            return next(error);
        }
        res.status(201).json({ messsage: 'Comment Created' });

    },
    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoDbIdPattern).required()
        });
        const {error} = getByIdSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const {id} = req.params;

        let comments;
        try {
            comments = await Comment.find({blog: id}).populate('author');  
        } catch (error) {
            return next(error);

        }
        let commentsDTO = [];
        for(let i = 0; i< comments.length; i++ ){
            const obj = new CommentDTO(comments[i]);     
            commentsDTO.push(obj);
        }
        res.status(200).json({data: commentsDTO});
    }
}
module.exports = commentController;