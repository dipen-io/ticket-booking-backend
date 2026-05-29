const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {config} = require("../config");

exports.hashToken = (refreshToken) => {
    return crypto.createHash('sha256').update(refreshToken).digest('hex')
}

exports.generateAccessToken  = (userId) => {
    const payload = {
        id: userId
    }

    return jwt.sign(payload, config.JWT_ACCESS_SECRET,{ expiresIn :config.JWT_ACCESS_SECRET_EXPIRY })
}

exports.generateRefreshToken = (userId) => {
    const paylaod = {
        id: userId,
        jti: crypto.randomUUID() // unique id for refreshToken
    }
    return jwt.sign(paylaod, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_SECRET_EXPIRY })
}

exports.verifyAccessToken = (accessToken) => {
   return jwt.verify(accessToken, config.JWT_ACCESS_SECRET); 
}

exports.verifyRefreshToken = (refreshToken) => {
   return jwt.verify(refreshToken, config.JWT_REFRESH_SECRET); 
}


