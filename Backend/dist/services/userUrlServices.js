"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectUrl = void 0;
const tryCatchWrapper_1 = __importDefault(require("../utils/tryCatchWrapper"));
const urlModel_1 = __importDefault(require("../models/urlModel"));
const logger_1 = __importDefault(require("../utils/logger"));
const dataExtraction_1 = require("../utils/dataExtraction");
const analyticsController_1 = require("../controller/analyticsController");
const apiError_1 = require("../utils/apiError");
exports.redirectUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    const { shortCode } = req.params;
    logger_1.default.info(`Attempting to redirect shortCode: ${shortCode}`);
    if (!shortCode) {
        throw new apiError_1.BadRequestError('Short code is required');
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fullShortUrl = `${baseUrl}/${shortCode}`;
    let url = await urlModel_1.default.findOne({
        shortUrl: fullShortUrl,
        isActive: true
    });
    if (!url) {
        // DEBUG: Try alternative approaches
        const alternativeUrl = await urlModel_1.default.findOne({
            shortUrl: { $regex: `/${shortCode}$` }, // Ends with /shortCode
            isActive: true
        });
        if (!alternativeUrl) {
            logger_1.default.warn(`URL not found for shortCode: ${shortCode}`, {
                searchedShortUrl: fullShortUrl,
                baseUrl: baseUrl
            });
            return res.status(404).json({
                success: false,
                message: 'URL not found or has been deactivated'
            });
        }
        // Use the alternative URL if found
        url = alternativeUrl;
    }
    logger_1.default.info(`URL found for ${shortCode}:`, {
        id: url._id,
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
        isActive: url.isActive,
        singleUse: url.singleUse
    });
    // Check if URL has expired
    if (url.expireAt && url.expireAt < new Date()) {
        logger_1.default.warn(`Expired URL accessed: ${shortCode}`);
        return res.status(410).json({
            success: false,
            message: 'This URL has expired'
        });
    }
    // Check if single-use URL has already been used
    if (url.singleUse) {
        logger_1.default.warn(`Single-use URL already accessed: ${shortCode}`);
        return res.status(410).json({
            success: false,
            message: 'This single-use URL has already been accessed'
        });
    }
    // Extract click tracking data
    const clickData = (0, dataExtraction_1.extractClickData)(req);
    // Track click asynchronously (don't block redirect)
    setImmediate(async () => {
        try {
            await (0, analyticsController_1.incrementClick)(url._id.toString(), {
                userId: url.user?.toString(),
                ...clickData
            });
            // Update URL document with total clicks and last accessed
            await urlModel_1.default.findByIdAndUpdate(url._id, {
                $inc: { totalClicks: 1 },
                $set: { lastClickedAt: new Date() }
            });
            logger_1.default.info(`Click tracked for shortCode: ${shortCode}`);
        }
        catch (error) {
            logger_1.default.error(`Error tracking click for ${shortCode}:`, error);
            // Don't fail the redirect if tracking fails
        }
    });
    // For single-use URLs, deactivate after first click
    if (url.singleUse) {
        setImmediate(async () => {
            try {
                await urlModel_1.default.findByIdAndUpdate(url._id, { isActive: false });
                logger_1.default.info(`Single-use URL deactivated: ${shortCode}`);
            }
            catch (error) {
                logger_1.default.error(`Error deactivating single-use URL ${shortCode}:`, error);
            }
        });
    }
    // Redirect to original URL
    logger_1.default.info(`Redirecting ${shortCode} to ${url.longUrl}`);
    res.redirect(301, url.longUrl);
});
