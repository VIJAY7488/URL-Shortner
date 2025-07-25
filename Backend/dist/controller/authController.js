import User from '../models/userModel';
import wrapAsyncFunction from '../utils/tryCatchWrapper';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { validateUserLogin, validateUserRegistration } from '../utils/validator';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import jwt from 'jsonwebtoken';
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
};
// Register a new user
export const registerUser = wrapAsyncFunction(async (req, res) => {
    logger.info('Register url hit');
    //Validation
    const { error } = validateUserRegistration(req.body);
    if (error) {
        logger.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        logger.error(`User with email ${email} already exists`);
        return res.status(400).json({ message: 'User already exists' });
    }
    ;
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = new User({
        name,
        email,
        password: hashedPassword,
    });
    await user.save();
    logger.info(`User registered successfully: ${email}`);
    // issue tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
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
export const loginUser = wrapAsyncFunction(async (req, res) => {
    logger.info('Login endpoint hit');
    //Validation
    const { error } = validateUserLogin(req.body);
    if (error) {
        logger.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        logger.error('User not found');
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        logger.error('Invalid password or email');
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    // issue tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    logger.info('Login successful');
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
export const refreshTokenUser = wrapAsyncFunction(async (req, res) => {
    logger.info('Refresh token endpoint hit');
    const token = req.cookies.refreshToken;
    if (!token) {
        logger.error('No refresh token provided');
        return res.status(401).json({ message: "No refresh token provided" });
    }
    ;
    const refreshSecret = process.env.REFRESH_TOKEN;
    const decoded = jwt.verify(token, refreshSecret);
    const userId = decoded.userId;
    if (!userId) {
        logger.error('Refresh token missing userId');
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    // issue new access token
    logger.info('New access token generated successfully');
    const newAccessToken = generateAccessToken(userId);
    res.status(200).json({
        success: true,
        accessToken: newAccessToken
    });
});
//Logout User
export const logoutUser = wrapAsyncFunction(async (req, res) => {
    logger.info('Logout endpoint hit');
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });
    logger.info('User Logged out successfully');
    res.json({ success: true, message: 'Logged out' });
});
export const getUser = wrapAsyncFunction(async (req, res) => {
    logger.info('Get user details endpoint hit');
    const userId = req.user.userId;
    if (!userId) {
        logger.info(`userId is missing or undefined: ${userId}`);
        return res.status(401).json({ message: "Unauthorized: userId missing" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    ;
    logger.info('User detail get successfully');
    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    });
});
