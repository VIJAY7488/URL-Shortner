var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["SUCCESS"] = 200] = "SUCCESS";
    ResponseStatus[ResponseStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseStatus[ResponseStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseStatus[ResponseStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseStatus[ResponseStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseStatus[ResponseStatus["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(ResponseStatus || (ResponseStatus = {}));
class ApiResponse {
    status;
    message;
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
    prepare(res, response, headers) {
        for (const [key, value] of Object.entries(headers))
            res.append(key, value);
        return res.status(this.status).json(ApiResponse.sanitize(response));
    }
    send(res, headers = {}) {
        return this.prepare(res, this, headers);
    }
    static sanitize(response) {
        const clone = {};
        Object.assign(clone, response);
        // @ts-ignore
        delete clone.status;
        for (const i in clone)
            if (typeof clone[i] === 'undefined')
                delete clone[i];
        return clone;
    }
}
export class AuthFailureResponse extends ApiResponse {
    constructor(message = 'Authentication Failure') {
        super(ResponseStatus.UNAUTHORIZED, message);
    }
}
export class NotFoundResponse extends ApiResponse {
    constructor(message = 'Not Found') {
        super(ResponseStatus.NOT_FOUND, message);
    }
    send(res, headers = {}) {
        return super.prepare(res, this, headers);
    }
}
export class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
        super(ResponseStatus.FORBIDDEN, message);
    }
}
export class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad Parameters') {
        super(ResponseStatus.BAD_REQUEST, message);
    }
}
export class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal Error') {
        super(ResponseStatus.INTERNAL_ERROR, message);
    }
}
export class SuccessMsgResponse extends ApiResponse {
    constructor(message) {
        super(ResponseStatus.SUCCESS, message);
    }
}
export class FailureMsgResponse extends ApiResponse {
    constructor(message) {
        super(ResponseStatus.SUCCESS, message);
    }
}
export class SuccessResponse extends ApiResponse {
    data;
    constructor(message, data) {
        super(ResponseStatus.SUCCESS, message);
        this.data = data;
    }
    send(res, headers = {}) {
        return super.prepare(res, this, headers);
    }
}
export class AccessTokenErrorResponse extends ApiResponse {
    instruction = 'refresh_token';
    constructor(message = 'Access token invalid') {
        super(ResponseStatus.UNAUTHORIZED, message);
    }
    send(res, headers = {}) {
        headers.instruction = this.instruction;
        return super.prepare(res, this, headers);
    }
}
export class TokenRefreshResponse extends ApiResponse {
    accessToken;
    refreshToken;
    constructor(message, accessToken, refreshToken) {
        super(ResponseStatus.SUCCESS, message);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
    send(res, headers = {}) {
        return super.prepare(res, this, headers);
    }
}
