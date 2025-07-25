"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = exports.validateUserLogin = exports.validateUserRegistration = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUserRegistration = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
    });
    return schema.validate(data);
};
exports.validateUserRegistration = validateUserRegistration;
const validateUserLogin = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
    });
    return schema.validate(data);
};
exports.validateUserLogin = validateUserLogin;
const validateUrl = (data) => {
    const schema = joi_1.default.object({
        longUrl: joi_1.default.string().uri().required()
    });
    return schema.validate({ longUrl: data });
};
exports.validateUrl = validateUrl;
