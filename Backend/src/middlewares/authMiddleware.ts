import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import logger from "../utils/logger";

export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}

export const authenticate = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction) => {
        
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.error('No token or invalid authorization header format');
        return res.status(401).json({
            success: false,
            message: 'No token or invalid authorization header'
        });
    }

    const token = authHeader?.split(" ")[1];

    if(!token){
        logger.error('No token, authorization denied');
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied'
        });
    }

    try {
        const secret = process.env.ACCESS_TOKEN as string;

        const decoded = jwt.
        verify(token, secret ) as jwt.JwtPayload;

        req.user = { userId: decoded.userId};
        next();
    } catch (error) {
        logger.error('Token is not valid');
        return res.status(401).json({ message: 'Token is not valid' });
    }
};