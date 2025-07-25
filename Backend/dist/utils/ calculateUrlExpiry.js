"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUrlExpiry = void 0;
const date_fns_1 = require("date-fns");
const logger_1 = __importDefault(require("./logger"));
const calculateUrlExpiry = (expireAt) => {
    if (typeof expireAt !== 'number' || isNaN(expireAt) || expireAt <= 0) {
        logger_1.default.warn('Invalid expireAt input:', expireAt);
        return undefined;
    }
    const expirationDate = (0, date_fns_1.addMinutes)(new Date(), expireAt);
    logger_1.default.info('Calculated Expiry Date:', expirationDate);
    return expirationDate;
};
exports.calculateUrlExpiry = calculateUrlExpiry;
