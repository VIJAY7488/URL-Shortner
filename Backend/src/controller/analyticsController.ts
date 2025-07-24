import Click, { clickSchemaProps } from "../models/clickLogModel";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { startOfDay, endOfDay, subDays, subMonths } from "date-fns";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";
import crypto from 'crypto';

// Helper Functions
const getDateRange = (period: string = '7d') => {
  const now = new Date();

  const ranges = {
    '1d': { start: subDays(now, 1), end: now },
    '7d': { start: subDays(now, 7), end: now },
    '30d': { start: subDays(now, 30), end: now },
    '90d': { start: subDays(now, 90), end: now },
    '1y': { start: subMonths(now, 12), end: now },
  };
  return ranges[period as keyof typeof ranges] || ranges['7d'];
};

const anonymizeIP = (ip: string): string => {
  return crypto.createHash('sha256').update(ip + 'salt').digest('hex').substring(0, 16);
};

const getToday = () => startOfDay(new Date());

// Increment Click
export const incrementClick = async (
  shortUrlId: string,
  clickData: {
    userId?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    ip?: string;
    country?: string;
    city?: string;
    referer?: string;
    userAgent?: string;
    isBot?: boolean;
    utmParams?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_term?: string;
      utm_content?: string;
    };
  }
) => {
  try {
    const ipHash = clickData.ip ? anonymizeIP(clickData.ip) : undefined;

    // For aggregated daily data
    const today = getToday();

    await Click.findOneAndUpdate(
      {
        shortUrl: new mongoose.Types.ObjectId(shortUrlId),
        timestamp: today,
        browser: clickData.browser,
        os: clickData.os,
        deviceType: clickData.deviceType,
        country: clickData.country
      },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          shortUrl: new mongoose.Types.ObjectId(shortUrlId),
          user: clickData.userId ? new mongoose.Types.ObjectId(clickData.userId) : undefined,
          timestamp: today,
          ipHash,
          city: clickData.city,
          referer: clickData.referer,
          userAgent: clickData.userAgent,
          isBot: clickData.isBot || false,
          ...clickData.utmParams
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create individual click record for detailed analytics
    await Click.create({
      shortUrl: new mongoose.Types.ObjectId(shortUrlId),
      user: clickData.userId ? new mongoose.Types.ObjectId(clickData.userId) : undefined,
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
    
  } catch (error) {
    logger.error('Error incrementing click:', error);
    throw error;
  }
};

// COMPREHENSIVE ANALYTICS ENDPOINT
export const getUrlAnalytics = wrapAsyncFunction(
  async (req: Request, res: Response) => {
    logger.info("getUrlAnalytics endpoint hit");

    const { shortId } = req.params;
    const { period = '7d' } = req.query;
    const dateRange = getDateRange(period as string);

    if (!shortId || !mongoose.Types.ObjectId.isValid(shortId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing shortId parameter" 
      });
    }

    const shortUrlObjectId = new mongoose.Types.ObjectId(shortId);

    try {
      // Parallel execution of multiple analytics queries
      const [
        totalClicks,
        uniqueVisitors,
        clicksByDate,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        referrerBreakdown,
        recentClicks
      ] = await Promise.all([
        // Total clicks (excluding bots)
        Click.aggregate([
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
        Click.distinct('ipHash', {
          shortUrl: shortUrlObjectId,
          timestamp: { $gte: dateRange.start, $lte: dateRange.end },
          isBot: { $ne: true },
          ipHash: { $exists: true }
        }),

        // Daily clicks
        Click.aggregate([
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
        Click.aggregate([
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
        Click.aggregate([
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
        Click.aggregate([
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
        Click.aggregate([
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
        Click.aggregate([
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
        Click.find({
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

      logger.info("Successfully fetched comprehensive analytics");
      res.json({ success: true, analytics });
    } catch (error) {
      logger.error("Error fetching analytics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching analytics data" 
      });
    }
  }
);

// Get Total Clicks of a User - FIXED FUNCTION
export const getTotalClicksOfUser = wrapAsyncFunction(
  async (req: Request, res: Response) => {
    logger.info("getTotalClicksOfUser endpoint hit");

    const { userId } = req.params;
    const { period = '30d' } = req.query;
    const dateRange = getDateRange(period as string);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing userId parameter" 
      });
    }

    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const [userStats, dailyStats] = await Promise.all([
        // Overall user statistics
        Click.aggregate([
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
        Click.aggregate([
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

      logger.info("Successfully fetched user analytics");
      res.json({ 
        success: true, 
        userStats: stats
      });
    } catch (error) {
      logger.error("Error fetching user analytics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching user analytics" 
      });
    }
  }
);

// Get Device/OS/Browser Breakdown for a URL
export const getClicksBreakdown = wrapAsyncFunction(
  async (req: Request, res: Response) => {
    logger.info("getClicksBreakdown endpoint hit");

    const { shortUrlId } = req.params;
    const { period = '30d' } = req.query;
    const dateRange = getDateRange(period as string);

    if (!shortUrlId || !mongoose.Types.ObjectId.isValid(shortUrlId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing shortUrlId parameter" 
      });
    }

    try {
      const breakdown = await Click.aggregate([
        {
          $match: {
            shortUrl: new mongoose.Types.ObjectId(shortUrlId),
            timestamp: { $gte: dateRange.start, $lte: dateRange.end },
            isBot: { $ne: true }  // Exclude bot traffic
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

      logger.info("Successfully fetched click breakdown");
      res.json({ success: true, breakdown, period });
    } catch (error) {
      logger.error("Error fetching click breakdown:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching click breakdown" 
      });
    }
  }
);