"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logoutUser = exports.refreshTokenUser = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const tryCatchWrapper_1 = __importDefault(require("../utils/tryCatchWrapper"));
const logger_1 = __importDefault(require("../utils/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = require("../utils/validator");
const generateToken_1 = require("../utils/generateToken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
};
// Register a new user
exports.registerUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Register url hit');
    //Validation
    const { error } = (0, validator_1.validateUserRegistration)(req.body);
    if (error) {
        logger_1.default.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await userModel_1.default.findOne({ email });
    if (existingUser) {
        logger_1.default.error(`User with email ${email} already exists`);
        return res.status(400).json({ message: 'User already exists' });
    }
    ;
    //hash the password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Create a new user
    const user = new userModel_1.default({
        name,
        email,
        password: hashedPassword,
    });
    await user.save();
    logger_1.default.info(`User registered successfully: ${email}`);
    // issue tokens
    const accessToken = (0, generateToken_1.generateAccessToken)(user._id);
    const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id);
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            accessToken: accessToken
        },
    });
});
// Login User
exports.loginUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Login endpoint hit');
    //Validation
    const { error } = (0, validator_1.validateUserLogin)(req.body);
    if (error) {
        logger_1.default.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { email, password } = req.body;
    // Check if user exists
    const user = await userModel_1.default.findOne({ email });
    if (!user) {
        logger_1.default.error('User not found');
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Check password
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        logger_1.default.error('Invalid password or email');
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    // issue tokens
    const accessToken = (0, generateToken_1.generateAccessToken)(user._id);
    const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id);
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    logger_1.default.info('Login successful');
    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            accessToken: accessToken
        },
    });
});
// Refresh Token
exports.refreshTokenUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Refresh token endpoint hit');
    const token = req.cookies.refreshToken;
    if (!token) {
        logger_1.default.error('No refresh token provided');
        return res.status(401).json({ message: "No refresh token provided" });
    }
    ;
    const refreshSecret = process.env.REFRESH_TOKEN;
    const decoded = jsonwebtoken_1.default.verify(token, refreshSecret);
    const userId = decoded.userId;
    if (!userId) {
        logger_1.default.error('Refresh token missing userId');
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    // issue new access token
    logger_1.default.info('New access token generated successfully');
    const newAccessToken = (0, generateToken_1.generateAccessToken)(userId);
    res.status(200).json({
        success: true,
        accessToken: newAccessToken
    });
});
//Logout User
exports.logoutUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Logout endpoint hit');
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });
    logger_1.default.info('User Logged out successfully');
    res.json({ success: true, message: 'Logged out' });
});
exports.getUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Get user details endpoint hit');
    const userId = req.user.userId;
    if (!userId) {
        logger_1.default.info(`userId is missing or undefined: ${userId}`);
        return res.status(401).json({ message: "Unauthorized: userId missing" });
    }
    const user = await userModel_1.default.findById(userId).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    ;
    logger_1.default.info('User detail get successfully');
    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    });
});
