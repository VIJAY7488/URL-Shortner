import { Request, Response, NextFunction } from "express";
import logger from "./logger";

export enum ErrorMessages {
  NotFound = "Resource not found",
  Conflict = "Conflict Error Occurred",
  BadRequest = "Bad request",
  Unauthorized = "Unauthorized",
  InternalServerError = "Internal Server Error"
}



class AppError extends Error {
    statusCode: number;
    isOperational: boolean // flag to indcate if the error is expected

    constructor(message: string, statusCode: number = 500, isOperational:boolean = true){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        })
    }

    logger.error(err.stack || err.message);
    
    res.status(500).json({
        success: false,
        message: err.message || ErrorMessages.InternalServerError
    })
};

class NotFoundError extends AppError {
    constructor(message: string = ErrorMessages.NotFound){
        super(message, 404);
    }
};

class ConflictError extends AppError {
    constructor(message: string = ErrorMessages.Conflict){
        super(message, 409);
    }
};

class BadRequestError extends AppError {
    constructor(message: string = ErrorMessages.BadRequest){
        super(message, 400);
    }
};

class UnauthorizedError extends AppError {
    constructor(message: string = ErrorMessages.BadRequest){
        super(message, 401);
    }
};

export default {
    AppError,
    errorHandler,
    NotFoundError,
    ConflictError,
    BadRequestError,
    UnauthorizedError
}