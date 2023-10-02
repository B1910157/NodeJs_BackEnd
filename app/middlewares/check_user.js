const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require("../api-error")
// const axios = require('axios');

const checkUser = (req, res, next) => {
   
    const authHeader = req.headers.authorization;
    console.log("auth ne: ",authHeader)
    if (!authHeader) {
        return next(new ApiError(401, 'Unauthorized: missing token'));
    }
    const token = authHeader.split(' ')[1];
   
    if (!token) {
        return next(new ApiError(400, "Unauthorized!!!!"));
    }
    jwt.verify(token, "secret", (error, decoded) => {
        if (error) {
            return next(new ApiError(401, "Unauthorized: invalid token"));
        }
        req.user = decoded;
        console.log("decoded: ",decoded)
        next();
    });
}

module.exports = checkUser;