const jwt = require('jsonwebtoken');

// ACCESS AND REFRESH TOKEN GENERATED WITH:
// ON TERMINAL WRITE node  THEN  const crypto = require('crypto');
// crypto.randomBytes(64).toString('hex')
const {ACCESS_TOKEN_SECRET ,REFRESH_TOKEN_SCRET } = require('../config/index');
const RefreshToken = require('../models/token');  //import token model

class JWTService{

    // sign access token - access token life is short as compares to refresh token
    // make static method so we directly access them by giveing class name 
    
    static signAccessToken(payload, expirtyTime,secret = ACCESS_TOKEN_SECRET){
        return jwt.sign(payload,secret, {expiresIn:expirtyTime});
    }
    // Sign refresh token
    
    // make static method so we directly access them by giveing class name 
    static  singRefreshToken( payload, expirtyTime , secret = REFRESH_TOKEN_SCRET ){
        return jwt.sign(payload, secret,{expiresIn:expirtyTime});
    }

    // verify token
    static verifyAccessToken(token,){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }

    // refresh token
    static verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SCRET);
    }

    // store refresh token in db

    static async storeRefreshToken(token , userId){
        try {
            const newToken = new RefreshToken({
                token:token,
                userId:userId
            })
            await newToken.save();

        } catch (error) {
            console.log(error);    
        }
    }

}module.exports = JWTService;