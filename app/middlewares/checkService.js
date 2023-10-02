const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require("../api-error")


const checkService = (req, res, next) => {
   
    const authHeader = req.headers.authorization;
    console.log("auth: ",authHeader)
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
        req.service = decoded;
        // console.log("req", req)
        console.log("decoded:(req.service) ",decoded)
        next();
    });
}

module.exports = checkService;