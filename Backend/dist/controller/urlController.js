"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUrl = exports.getAllUserUrl = exports.userShortenUrl = exports.publicShortenUrl = void 0;
const nanoid_1 = require("nanoid");
const urlModel_1 = __importDefault(require("../models/urlModel"));
const tryCatchWrapper_1 = __importDefault(require("../utils/tryCatchWrapper"));
const logger_1 = __importDefault(require("../utils/logger"));
const qrcode_1 = __importDefault(require("qrcode"));
const validator_1 = require("../utils/validator");
const _calculateUrlExpiry_1 = require("../utils/ calculateUrlExpiry");
const apiError_1 = require("../utils/apiError");
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const generateShortCode = (customUrl, alias) => {
    if (customUrl && alias) {
        return `${customUrl}/${alias}`;
    }
    else if (customUrl) {
        return customUrl;
    }
    else {
        const nanoCode = (0, nanoid_1.nanoid)(7);
        return nanoCode; // Just the code, not the full URL
    }
};
const buildFullUrl = (shortCode) => {
    return `${process.env.MY_URL}/${shortCode}`;
};
const generateQRCode = async (url) => {
    try {
        return await qrcode_1.default.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }
    catch (error) {
        logger_1.default.error('QR Code generation failed:', error);
        throw new apiError_1.BadRequestError('Failed to generate QR code');
    }
};
// =====================================================
// PUBLIC URL SHORTENING
// =====================================================
exports.publicShortenUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('public shorten url endpoint hit');
    const { error } = (0, validator_1.validateUrl)(req.body);
    if (error) {
        logger_1.default.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { longUrl } = req.body;
    if (!longUrl) {
        throw new apiError_1.BadRequestError('"longUrl is required"');
    }
    // Rate limiting: Check how many times this longUrl has been shortened
    const urlCount = await urlModel_1.default.countDocuments({ longUrl });
    if (urlCount >= 5) {
        logger_1.default.warn(`Rate limit hit for longUrl: ${longUrl}`);
        return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded: Cannot shorten the same URL more than 5 times.',
        });
    }
    // Generate new short URL
    const shortCode = generateShortCode();
    const fullShortUrl = buildFullUrl(shortCode);
    const qrCode = await generateQRCode(fullShortUrl);
    const newUrl = await urlModel_1.default.create({
        longUrl,
        shortUrl: fullShortUrl,
        qrcode: qrCode
    });
    logger_1.default.info(`Public short URL created: ${shortCode}`);
    res.status(201).json({
        success: true,
        data: {
            id: newUrl._id,
            longUrl: newUrl.longUrl,
            shortUrl: newUrl.shortUrl,
            qrcode: newUrl.qrcode,
        }
    });
});
// =====================================================
// USER URL SHORTENING (AUTHENTICATED)
// =====================================================
exports.userShortenUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('user shorten url endpoint hit');
    const { title, longUrl, customUrl, expireAt, passwordProtected, passwordForUrl, singleUse, } = req.body;
    if (!longUrl) {
        throw new apiError_1.BadRequestError('longUrl is required');
    }
    const userId = req.user?.userId;
    if (!userId) {
        throw new apiError_1.AuthFailureError('Unauthorized: userId missing');
    }
    // Validation for URL format
    const { error } = (0, validator_1.validateUrl)(longUrl);
    if (error) {
        throw new apiError_1.BadRequestError(error.details[0].message);
    }
    // Check if user has already shortened this URL
    const existingUrl = await urlModel_1.default.findOne({ longUrl, user: userId });
    if (existingUrl) {
        logger_1.default.info('User already has this URL shortened');
        return res.status(200).json({
            success: true,
            message: 'URL already shortened by this user',
            data: existingUrl
        });
    }
    // Check if custom alias is already taken
    if (customUrl) {
        const customCode = generateShortCode(customUrl);
        const existingCustom = await urlModel_1.default.findOne({ shortCode: customCode });
        if (existingCustom) {
            throw new apiError_1.ConflictError('Custom URL/alias is already taken');
        }
    }
    // Generate URLs and QR code
    const shortCode = generateShortCode(customUrl);
    const fullShortUrl = buildFullUrl(shortCode);
    const qrCode = await generateQRCode(fullShortUrl);
    const expireDate = expireAt ? (0, _calculateUrlExpiry_1.calculateUrlExpiry)(expireAt) : null;
    // Create new URL document
    const urlData = {
        title,
        longUrl,
        shortCode,
        shortUrl: fullShortUrl,
        user: userId,
        expireAt: expireDate,
        qrcode: qrCode,
        singleUse: singleUse || false,
        passwordForUrl,
        isActive: true
    };
    const newUrl = await urlModel_1.default.create(urlData);
    logger_1.default.info(`User short URL created: ${shortCode} for user: ${userId}`);
    res.status(201).json({
        success: true,
        message: 'URL shortened successfully',
        data: {
            id: newUrl._id,
            title: newUrl.title,
            longUrl: newUrl.longUrl,
            shortUrl: newUrl.shortUrl,
            qrcode: newUrl.qrcode,
            expireAt: newUrl.expireAt,
            singleUse: newUrl.singleUse,
            passwordForUrl: newUrl.passwordForUrl,
        }
    });
});
// =====================================================
// GET ALL USER URLS (WITH PAGINATION)
// =====================================================
exports.getAllUserUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Get all user URLs endpoint hit');
    const userId = req.user?.userId;
    logger_1.default.info(`userId: ${userId}`);
    if (!userId) {
        throw new apiError_1.AuthFailureError('Unauthorized: userId missing');
    }
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Search and filter parameters
    const search = req.query.search;
    const status = req.query.status; // 'active', 'expired', 'all'
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    // Build query
    const query = { user: userId };
    // Add search filter
    if (search) {
        query.$or = [
            { longUrl: { $regex: search, $options: 'i' } },
            { shortCode: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    // Add status filter
    if (status === 'active') {
        query.isActive = true;
        query.$or = [
            { expireAt: { $exists: false } },
            { expireAt: null },
            { expireAt: { $gt: new Date() } }
        ];
    }
    else if (status === 'expired') {
        query.expireAt = { $lte: new Date() };
    }
    // Execute queries in parallel
    const [urls, totalCount] = await Promise.all([
        urlModel_1.default.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('title longUrl user shortUrl shortCode totalClicks createdAt expireAt isActive singleUse')
            .lean(),
        urlModel_1.default.countDocuments(query)
    ]);
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    logger_1.default.info(`Retrieved ${urls.length} URLs for user ${userId}`);
    res.status(200).json({
        success: true,
        data: {
            urls,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage,
                hasPrevPage,
                limit
            }
        }
    });
});
// =====================================================
// DELETE URL
// =====================================================
exports.deleteUrl = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info('Delete URL endpoint hit');
    const { urlId } = req.params;
    if (!urlId) {
        logger_1.default.error('URL id not found in params');
        return res.status(400).json({
            success: false,
            message: 'URL id is required',
        });
    }
    const deletedUrl = await urlModel_1.default.findOneAndDelete({
        _id: urlId,
    });
    if (!deletedUrl) {
        throw new apiError_1.NotFoundError('URL not found');
    }
    logger_1.default.info(`URL deleted: ${urlId}`);
    res.status(200).json({
        success: true,
        message: 'URL deleted successfully'
    });
});
