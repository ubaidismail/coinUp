const express = require('express');  
const authcontroller = require('../controller/authController');
const auth = require('../middlewares/auth');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const router = express.Router();

// ## testing

router.get('/test' , (req,res) => {
    res.json({msg:'working'}
);
})

// ## register
router.post('/register' , authcontroller.register);

// ## login
router.post('/login' , authcontroller.login);
router.get('/logout' , auth, authcontroller.logout);
// refresh  
router.get('/refresh' ,authcontroller.refresh);

// work on blog controller

// create
router.post('/blog' , auth, blogController.create);

// get all
router.get('/blog/all' , auth, blogController.getAll);
// get blog by id
router.get('/blog/:id' , auth, blogController.getById);

// update
router.put('/blog' , auth, blogController.update);

// delete
router.delete('/blog/:id' , auth, blogController.delete);

// comments
// create comment 
router.post('/comment' , auth, commentController.create);

// get comment
router.get('/comment/:id' , auth, commentController.getById);

module.exports = router;