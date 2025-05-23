const { findUserById } = require("../dao/user.dao");
const { verifyToken } = require("../utils/helper");

const authMiddleware = async(req, res, next) => {
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json({message:"Unauthorized"});
    try {
        const decoded = verifyToken(token);
        const user = findUserById(decoded);
        if(!user) return res.status(401).json({message:"Unauthorized"});
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message:"Unauthorized",error})
    }
};

module.exports = authMiddleware;