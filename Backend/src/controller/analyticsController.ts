import Click from "../models/clickLogModel";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { startOfDay, endOfDay } from "date-fns";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";

// Helper to normalize date
const getToday = () => startOfDay(new Date());

// Increment Click 
export const incrementClick = async (
    shortUrlId: string,
    userId?: string,
    browser?: string,
    os?: string,
    deviceType?: string
) => {
    const today = getToday();

    await Click.findOneAndUpdate(
        {
            shortUrl: new mongoose.Types.ObjectId(shortUrlId),
            date: today,
            browser,
            os,
            deviceType,
        },
        {
            $inc: { count: 1 },
            $setOnInsert: {
                shortUrl: new mongoose.Types.ObjectId(shortUrlId),
                user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
                date: today,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

// Get Daily Clicks (date-wise)
export const getDailyClicks = wrapAsyncFunction(async (req: Request, res: Response) => {
    logger.info('getDailyClicks endpoint hit');

    const { shortUrlId, startDate, endDate } = req.query;

    if (!shortUrlId || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const clicks = await Click.aggregate([
        {
            $match: {
                shortUrl: new mongoose.Types.ObjectId(shortUrlId as string),
                date: {
                    $gte: startOfDay(new Date(startDate as string)),
                    $lte: endOfDay(new Date(endDate as string)),
                },
            },
        },
        {
            $group: {
                _id: "$date",
                totalClicks: { $sum: "$count" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    logger.info('Successfully fetched daily clicks');
    res.json({ success: true, data: clicks });
});

// Get Total Clicks for a User
export const getTotalClicksForUser = wrapAsyncFunction(async (req: Request, res: Response) => {
    logger.info('getTotalClicksForUser endpoint hit');

    const { userId } = req.params;
    const { start, end } = req.query;

    if (!userId || !start || !end) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const startDate = startOfDay(new Date(start as string));
    const endDate = endOfDay(new Date(end as string));

    const result = await Click.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: "$date",
                totalClicks: { $sum: "$count" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const totalClicks = result.reduce((sum, record) => sum + record.totalClicks, 0);

    logger.info('Successfully fetched total clicks for user');
    res.json({ success: true, totalClicks });
});

// Get Device/OS/Browser Breakdown for a URL
export const getClicksBreakdown = wrapAsyncFunction(async (req: Request, res: Response) => {
    logger.info('getClicksBreakdown endpoint hit');

    const { shortUrlId } = req.params;

    if (!shortUrlId) {
        return res.status(400).json({ success: false, message: "Missing shortUrlId parameter" });
    }

    const breakdown = await Click.aggregate([
        {
            $match: {
                shortUrl: new mongoose.Types.ObjectId(shortUrlId),
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

    logger.info('Successfully fetched click breakdown');
    res.json({ success: true, breakdown });
});
