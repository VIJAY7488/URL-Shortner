"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger_1.default.error('No token or invalid authorization header format');
        return res.status(401).json({
            success: false,
            message: 'No token or invalid authorization header'
        });
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
        logger_1.default.error('No token, authorization denied');
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied'
        });
    }
    try {
        const secret = process.env.ACCESS_TOKEN;
        const decoded = jsonwebtoken_1.default.
            verify(token, secret);
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        logger_1.default.error('Token is not valid');
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authenticate = authenticate;
