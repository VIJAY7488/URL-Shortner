"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.AccessTokenError = exports.NoDataError = exports.TokenExpiredError = exports.BadTokenError = exports.NoEntryError = exports.ForbiddenError = exports.NotFoundError = exports.BadRequestError = exports.InternalError = exports.AuthFailureError = exports.ApiError = exports.ErrorType = void 0;
const apiResponse_1 = require("./apiResponse");
var ErrorType;
(function (ErrorType) {
    ErrorType["BAD_TOKEN"] = "BadTokenError";
    ErrorType["TOKEN_EXPIRED"] = "TokenExpiredError";
    ErrorType["UNAUTHORIZED"] = "AuthFailureError";
    ErrorType["ACCESS_TOKEN"] = "AccessTokenError";
    ErrorType["INTERNAL"] = "InternalError";
    ErrorType["NOT_FOUND"] = "NotFoundError";
    ErrorType["NO_ENTRY"] = "NoEntryError";
    ErrorType["NO_DATA"] = "NoDataError";
    ErrorType["BAD_REQUEST"] = "BadRequestError";
    ErrorType["FORBIDDEN"] = "ForbiddenError";
    ErrorType["Conflict"] = "ConflictError";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class ApiError extends Error {
    constructor(type, message = 'error') {
        super(type);
        this.type = type;
        this.message = message;
    }
    static handle(err, res) {
        switch (err.type) {
            case ErrorType.BAD_TOKEN:
            case ErrorType.TOKEN_EXPIRED:
            case ErrorType.UNAUTHORIZED:
                return new apiResponse_1.AuthFailureResponse(err.message).send(res);
            case ErrorType.ACCESS_TOKEN:
                return new apiResponse_1.AccessTokenErrorResponse(err.message).send(res);
            case ErrorType.INTERNAL:
                return new apiResponse_1.InternalErrorResponse(err.message).send(res);
            case ErrorType.NOT_FOUND:
            case ErrorType.NO_ENTRY:
            case ErrorType.NO_DATA:
                return new apiResponse_1.NotFoundResponse(err.message).send(res);
            case ErrorType.BAD_REQUEST:
                return new apiResponse_1.BadRequestResponse(err.message).send(res);
            case ErrorType.FORBIDDEN:
                return new apiResponse_1.ForbiddenResponse(err.message).send(res);
            default: {
                let message = err.message;
                return new apiResponse_1.InternalErrorResponse(message).send(res);
            }
        }
    }
}
exports.ApiError = ApiError;
class AuthFailureError extends ApiError {
    constructor(message = 'Invalid Credentials') {
        super(ErrorType.UNAUTHORIZED, message);
    }
}
exports.AuthFailureError = AuthFailureError;
class InternalError extends ApiError {
    constructor(message = 'Internal error') {
        super(ErrorType.INTERNAL, message);
    }
}
exports.InternalError = InternalError;
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(ErrorType.BAD_REQUEST, message);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(ErrorType.NOT_FOUND, message);
    }
}
exports.NotFoundError = NotFoundError;
class ForbiddenError extends ApiError {
    constructor(message = 'Permission denied') {
        super(ErrorType.FORBIDDEN, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NoEntryError extends ApiError {
    constructor(message = "Entry don't exists") {
        super(ErrorType.NO_ENTRY, message);
    }
}
exports.NoEntryError = NoEntryError;
class BadTokenError extends ApiError {
    constructor(message = 'Token is not valid') {
        super(ErrorType.BAD_TOKEN, message);
    }
}
exports.BadTokenError = BadTokenError;
class TokenExpiredError extends ApiError {
    constructor(message = 'Token is expired') {
        super(ErrorType.TOKEN_EXPIRED, message);
    }
}
exports.TokenExpiredError = TokenExpiredError;
class NoDataError extends ApiError {
    constructor(message = 'No data available') {
        super(ErrorType.NO_DATA, message);
    }
}
exports.NoDataError = NoDataError;
class AccessTokenError extends ApiError {
    constructor(message = 'Invalid access token') {
        super(ErrorType.ACCESS_TOKEN, message);
    }
}
exports.AccessTokenError = AccessTokenError;
class ConflictError extends ApiError {
    constructor(message = 'Already exist') {
        super(ErrorType.Conflict, message);
    }
}
exports.ConflictError = ConflictError;
