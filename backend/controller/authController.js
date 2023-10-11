const Joi = require("joi");
const User = require('../models/user');
var bcrypt = require('bcryptjs');
const DTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token');

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const authcontroller = {
    async register(req, res, next) {
        // 1. validate user input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const { error } = userRegisterSchema.validate(req.body);

        // 2. if error in validation => return error via middleware
        if (error) {
            return next(error);
        }
        // 3. if email or username is already registered

        const { username, name, email, password } = req.body;
        try {

            const emailInUse = await User.exists({ email: email });
            const userInUse = await User.exists({ username: username });
            if (emailInUse) {
                const error = {
                    status: 409,
                    message: 'Email Already registered Use another',
                }
                return next(error);
            }
            if (userInUse) {
                const error = {
                    status: 409,
                    message: 'Username Already registered, Use another',
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }

        // password hash
        const hashPass = await bcrypt.hash(password, 10);

        // Store user data
        // setup cookie
        let accessToken;
        let refreshToken;
        let user;
        try {
            const userToRegister = new User({
                username: username,
                email: email,
                name: name,
                password: hashPass
            });
            user = await userToRegister.save();
            accessToken = JWTService.signAccessToken({ _id: user._id }, '30min');
            refreshToken = JWTService.singRefreshToken({ _id: user.id }, '60min'); // format got from DTO

        } catch (error) {
            return next(error);
        }
        // store refresh token in db
        JWTService.storeRefreshToken(refreshToken , User._id);

        // send token in cookies
        res.cookie('accessToken', accessToken,{
            maxAge: 1000 * 60 * 60 * 24,// 10000 milisecond * 60 = 1min * 60 = 1 hour
            httpOnly: true, // for security on client side // client will not get it// to avoid xss attacks

        })
        res.cookie('refreshToken' , refreshToken,{
            maxAge: 1000 * 60 * 60 * 24,// 10000 milisecond * 60 = 1min * 60 = 1 hour
            httpOnly: true, // for security on client side // client will not get it// to avoid xss attacks

        })

        // User DTO 

        const userDto = new DTO(user);

        //  return response

        return res.status(201).send({ userDto , auth:true});
    },
    async login(req, res, next) {

        // ##validate user input
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            // email:Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
        });
        // ## if validation error, return error
        const { error } = userLoginSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        // ### Match username and pass
        const { username, password } = req.body; //desctrucring
        let user;
        try {

            // math user name
            user = await User.findOne({ username: username });
            if (!user) {
                const error = {
                    status: 401,
                    message: 'Invalid Username'
                }
                return next(error);
            }

            // match password
            // req.body password -> hash -> match

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                const error = {
                    status: 401,
                    message: 'Invalid Password'
                }
                return next(error);
            }

        } catch (error) {
            return next(error);

        }
        const userDto = new DTO(user); // DTO data transfer object
        // ## return response if matched
        // return res.status(200).send({user}); 
        return res.status(200).json({ userDto, auth:true });
    },

    // logout

    async logout(req,res,next){
        // delete reresh token from cookie
        
        const {refreshToken} = req.cookies;
        try {
            await RefreshToken.deleteOne({token: refreshToken});
        } catch (error) {
            return next(error);
        }
        // delete cookies

        res.clearCookie('accessToken')
        res.clearCookie('refreshToken');
        // response
        return res.status(200).json({user:null, auth:false});
    },
    // Refresh token

    async refresh(req,res,next){
        // get refresh token from cookies
        // verify refresh token and get id
        // generate new token 
        // update db
        // return resp

        // first get orignial refresh token

        const originalRefreshToken = req.cookies.refreshToken;
        // now get id

        let id;
        try {

            id = JWTService .verifyRefreshToken(originalRefreshToken)._id;
            
        } catch (e) {
            const error = {
                status: 401,
                message:'Unauthorized',
            }
            return next(error);
        }

        try {
            const match = RefreshToken.findOne({_id:id, token:originalRefreshToken});
            if(!match){
                const error = {
                    status: 401,
                    message:'Unauthorized',
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        // generate new tokens

        try {
            const accessToken = JWTService.signAccessToken({_id:id}, '30m');
            const refreshToken = JWTService.singRefreshToken({_id:id}, '60m');
            // update in cookies

            await RefreshToken.updateOne({_id:id},{token:refreshToken});

            res.cookie('accessToken' , accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly:true
            })
            res.cookie('refreshToken' , refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly:true
            })
        } catch (error) {
            return next(error);
        }
        const user = await User.findOne({_id:id});
        const userDTO = new DTO(user);
        return res.status(200).json({user:userDTO, auth:true});
    }
}
module.exports = authcontroller;