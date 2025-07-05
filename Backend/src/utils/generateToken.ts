
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateAccessToken = (userId: Types.ObjectId) => {
    const secret = process.env.ACCESS_TOKEN as string;
    return jwt.sign({userId: userId}, secret, {expiresIn: '6h'})
};

export const generateRefreshToken = (userId: Types.ObjectId) => {
    const secret = process.env.REFRESH_TOKEN as string;
    return jwt.sign({userId: userId}, secret, {expiresIn: '7d'});
};