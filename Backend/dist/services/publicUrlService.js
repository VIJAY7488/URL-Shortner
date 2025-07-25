"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectPublicUrlToLongUrl = void 0;
const urlModel_1 = __importDefault(require("../models/urlModel"));
const tryCatchWrapper_1 = __importDefault(require("../utils/tryCatchWrapper"));
const logger_1 = __importDefault(require("../utils/logger"));
const apiError_1 = require("../utils/apiError");
exports.redirectPublicUrlToLongUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Public URL redirect endpoint accessed');
    const shortCode = req.params.shortUrl?.trim();
    if (!shortCode) {
        throw new apiError_1.NotFoundError('Short URL does not get');
    }
    ;
    const urlDoc = await urlModel_1.default.findOne({
        $or: [
            { shortUrl: shortCode },
            { shortUrl: `${process.env.MY_URL}/${shortCode}` }
        ]
    });
    if (!urlDoc) {
        logger_1.default.warn(`Short URL not found: ${shortCode}`);
        throw new apiError_1.NotFoundError('Short URL not found');
    }
    logger_1.default.info(`Redirecting: ${shortCode} → ${urlDoc.longUrl}`);
    return res.redirect(302, urlDoc.longUrl);
});
