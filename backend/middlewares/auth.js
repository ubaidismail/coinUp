const JWTService = require('../services/JWTService');
const User = require('../models/user');
const DTO = require('../dto/user');
const UserDTO = require('../dto/user');
const auth = async (req, res, next) => {
    // 1. refresh, access token validation

    try {
        const { refreshToken, accessToken } = req.cookies;

        if (!refreshToken || !accessToken) {
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error);
        }

        let _id;
        try {
            _id = JWTService.verifyAccessToken(accessToken);


        } catch (error) {
        }
        let user;
        try {
            user = await User.findOne({ _id: _id });
        }
        catch (error) {
            return next(error);

        }
        const userDto = new DTO(user);
        req.user = UserDTO;

        next();
    } catch (error) {
        return next(error);

    }
}
module.exports = auth;