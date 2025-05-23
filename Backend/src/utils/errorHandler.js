const errorhandler = (err, req, res, next) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: true,
            message: err.message,
        })
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    })
};

class AppError extends Error {
    statusCode; //HTTP status code.
    isOperational; //flag to indicate if the error is expected.

    constructor(message, statusCode=500, isOperational=true){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor); // helps keep the stack trace clean by removing the constructor frame.
    }
};

class NotFoumdError extends AppError {
    constructor(message = "Resource not found"){
        super(message, 404);
    }
};


class ConflictError extends AppError {
    constructor(message = "Conflict occurred"){
        super(message, 409);
    }
};


class BadRequestError extends AppError {
    constructor(message = "Bad request"){
        super(message, 400);
    }
};


class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized"){
        super(message, 401);
    }
};

module.exports = {
    errorhandler,
    AppError,
    NotFoumdError,
    ConflictError,
    BadRequestError,
    UnauthorizedError
}