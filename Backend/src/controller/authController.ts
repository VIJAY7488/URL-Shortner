import User from "../models/userModel";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import { Request, Response } from "express";
import logger from "../utils/logger";
import bcrypt from "bcryptjs";    
import {validateUserRegistration} from '../utils/validator'

// Register a new user
export const registerUser = wrapAsyncFunction(async (req: Request, res: Response) => {
    logger.info('Register url hit');

    //Validation
    const { error } = validateUserRegistration(req.body) ;
    if(error){
        logger.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        logger.error(`User with email ${email} already exists`);
        return res.status(400).json({ message: "User already exists" });
    };

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
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    });
}); 
