"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClicksBreakdown = exports.getTotalClicksOfUser = exports.getUrlAnalytics = exports.incrementClick = void 0;
const clickLogModel_1 = __importDefault(require("../models/clickLogModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const date_fns_1 = require("date-fns");
const tryCatchWrapper_1 = __importDefault(require("../utils/tryCatchWrapper"));
const logger_1 = __importDefault(require("../utils/logger"));
const crypto_1 = __importDefault(require("crypto"));
// Helper Functions
const getDateRange = (period = '7d') => {
    const now = new Date();
    const ranges = {
        '1d': { start: (0, date_fns_1.subDays)(now, 1), end: now },
        '7d': { start: (0, date_fns_1.subDays)(now, 7), end: now },
        '30d': { start: (0, date_fns_1.subDays)(now, 30), end: now },
        '90d': { start: (0, date_fns_1.subDays)(now, 90), end: now },
        '1y': { start: (0, date_fns_1.subMonths)(now, 12), end: now },
    };
    return ranges[period] || ranges['7d'];
};
const anonymizeIP = (ip) => {
    return crypto_1.default.createHash('sha256').update(ip + 'salt').digest('hex').substring(0, 16);
};
const getToday = () => (0, date_fns_1.startOfDay)(new Date());
// Increment Click
const incrementClick = async (shortUrlId, clickData) => {
    try {
        const ipHash = clickData.ip ? anonymizeIP(clickData.ip) : undefined;
        // For aggregated daily data
        const today = getToday();
        await clickLogModel_1.default.findOneAndUpdate({
            shortUrl: new mongoose_1.default.Types.ObjectId(shortUrlId),
            timestamp: today,
            browser: clickData.browser,
            os: clickData.os,
            deviceType: clickData.deviceType,
            country: clickData.country
        }, {
            $inc: { count: 1 },
            $setOnInsert: {
                shortUrl: new mongoose_1.default.Types.ObjectId(shortUrlId),
                user: clickData.userId ? new mongoose_1.default.Types.ObjectId(clickData.userId) : undefined,
                timestamp: today,
                ipHash,
                city: clickData.city,
                referer: clickData.referer,
                userAgent: clickData.userAgent,
                isBot: clickData.isBot || false,
                ...clickData.utmParams
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        // Create individual click record for detailed analytics
        await clickLogModel_1.default.create({
            shortUrl: new mongoose_1.default.Types.ObjectId(shortUrlId),
            user: clickData.userId ? new mongoose_1.default.Types.ObjectId(clickData.userId) : undefined,
            timestamp: new Date(), // Real timestamp for individual clicks
            count: 0,
            browser: clickData.browser,
            os: clickData.os,
            deviceType: clickData.deviceType,
            ipHash,
            country: clickData.country,
            city: clickData.city,
            referer: clickData.referer,
            userAgent: clickData.userAgent,
            isBot: clickData.isBot || false,
            ...clickData.utmParams
        });
        return true;
    }
    catch (error) {
        logger_1.default.error('Error incrementing click:', error);
        throw error;
    }
};
exports.incrementClick = incrementClick;
// COMPREHENSIVE ANALYTICS ENDPOINT
exports.getUrlAnalytics = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info("getUrlAnalytics endpoint hit");
    const { shortId } = req.params;
    const { period = '7d' } = req.query;
    const dateRange = getDateRange(period);
    if (!shortId || !mongoose_1.default.Types.ObjectId.isValid(shortId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing shortId parameter"
        });
    }
    const shortUrlObjectId = new mongoose_1.default.Types.ObjectId(shortId);
    try {
        // Parallel execution of multiple analytics queries
        const [totalClicks, uniqueVisitors, clicksByDate, deviceBreakdown, browserBreakdown, osBreakdown, countryBreakdown, referrerBreakdown, recentClicks] = await Promise.all([
            // Total clicks (excluding bots)
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true }
                    }
                },
                { $group: { _id: null, total: { $sum: "$count" } } }
            ]),
            // Unique visitors by IP hash
            clickLogModel_1.default.distinct('ipHash', {
                shortUrl: shortUrlObjectId,
                timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                isBot: { $ne: true },
                ipHash: { $exists: true }
            }),
            // Daily clicks
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$timestamp"
                            }
                        },
                        totalClicks: { $sum: "$count" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            // Device breakdown
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: "$deviceType",
                        count: { $sum: "$count" }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            // Browser breakdown
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true },
                        browser: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$browser",
                        count: { $sum: "$count" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // OS breakdown
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true },
                        os: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$os",
                        count: { $sum: "$count" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // Country breakdown
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true },
                        country: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$country",
                        count: { $sum: "$count" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),
            // Top referrers
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        shortUrl: shortUrlObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true },
                        referer: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$referer",
                        count: { $sum: "$count" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // Recent clicks for real-time feed
            clickLogModel_1.default.find({
                shortUrl: shortUrlObjectId,
                isBot: { $ne: true }
            })
                .sort({ timestamp: -1 })
                .limit(20)
                .select('timestamp country city browser deviceType referer')
        ]);
        const analytics = {
            totalClicks: totalClicks[0]?.total || 0,
            uniqueVisitors: uniqueVisitors.length,
            period,
            dateRange,
            clicksByDate: clicksByDate.map(item => ({
                date: item._id,
                clicks: item.totalClicks
            })),
            deviceBreakdown: deviceBreakdown.map(item => ({
                device: item._id || 'Unknown',
                count: item.count
            })),
            browserBreakdown: browserBreakdown.map(item => ({
                browser: item._id,
                count: item.count
            })),
            osBreakdown: osBreakdown.map(item => ({
                os: item._id,
                count: item.count
            })),
            countryBreakdown: countryBreakdown.map(item => ({
                country: item._id,
                count: item.count
            })),
            referrerBreakdown: referrerBreakdown.map(item => ({
                referrer: item._id,
                count: item.count
            })),
            recentClicks: recentClicks
        };
        logger_1.default.info("Successfully fetched comprehensive analytics");
        res.json({ success: true, analytics });
    }
    catch (error) {
        logger_1.default.error("Error fetching analytics:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching analytics data"
        });
    }
});
// Get Total Clicks of a User - FIXED FUNCTION
exports.getTotalClicksOfUser = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info("getTotalClicksOfUser endpoint hit");
    const { userId } = req.params;
    const { period = '30d' } = req.query;
    const dateRange = getDateRange(period);
    if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing userId parameter"
        });
    }
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const [userStats, dailyStats] = await Promise.all([
            // Overall user statistics
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        user: userObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalClicks: { $sum: "$count" },
                        uniqueUrls: { $addToSet: "$shortUrl" }
                    }
                }
            ]),
            // Daily breakdown
            clickLogModel_1.default.aggregate([
                {
                    $match: {
                        user: userObjectId,
                        timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                        isBot: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$timestamp"
                            }
                        },
                        dailyClicks: { $sum: "$count" }
                    }
                },
                { $sort: { "_id": 1 } }
            ])
        ]);
        // Format response data
        const stats = {
            totalClicks: userStats[0]?.totalClicks || 0,
            uniqueUrls: userStats[0]?.uniqueUrls?.length || 0,
            period,
            dateRange,
            dailyBreakdown: dailyStats.map(item => ({
                date: item._id,
                clicks: item.dailyClicks
            }))
        };
        logger_1.default.info("Successfully fetched user analytics");
        res.json({
            success: true,
            userStats: stats
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching user analytics:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user analytics"
        });
    }
});
// Get Device/OS/Browser Breakdown for a URL
exports.getClicksBreakdown = (0, tryCatchWrapper_1.default)(async (req, res) => {
    logger_1.default.info("getClicksBreakdown endpoint hit");
    const { shortUrlId } = req.params;
    const { period = '30d' } = req.query;
    const dateRange = getDateRange(period);
    if (!shortUrlId || !mongoose_1.default.Types.ObjectId.isValid(shortUrlId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing shortUrlId parameter"
        });
    }
    try {
        const breakdown = await clickLogModel_1.default.aggregate([
            {
                $match: {
                    shortUrl: new mongoose_1.default.Types.ObjectId(shortUrlId),
                    timestamp: { $gte: dateRange.start, $lte: dateRange.end },
                    isBot: { $ne: true } // Exclude bot traffic
                },
            },
            {
                $group: {
                    _id: {
                        browser: "$browser",
                        os: "$os",
                        deviceType: "$deviceType",
                    },
                    totalClicks: { $sum: "$count" },
                },
            },
            { $sort: { totalClicks: -1 } },
        ]);
        logger_1.default.info("Successfully fetched click breakdown");
        res.json({ success: true, breakdown, period });
    }
    catch (error) {
        logger_1.default.error("Error fetching click breakdown:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching click breakdown"
        });
    }
});
