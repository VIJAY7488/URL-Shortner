const nanoid = require("nanoid");
const jwt = require("jsonwebtoken");


const generateNanoId = (length) => {
    return nanoid(length);
};

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
};

const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id)
    return decoded.id
};

module.exports = {
    generateNanoId,
    signToken,
    verifyToken
}


