"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrapAsyncFunction = (fn) => {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.default = wrapAsyncFunction;
