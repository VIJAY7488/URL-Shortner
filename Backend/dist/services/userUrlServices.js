import wrapAsyncFunction from "../utils/tryCatchWrapper";
import Url from '../models/urlModel';
import logger from '../utils/logger';
import { extractClickData } from '../utils/dataExtraction';
import { incrementClick } from '../controller/analyticsController';
import { BadRequestError } from '../utils/apiError';
export const redirectUrl = wrapAsyncFunction(async (req, res) => {
    const { shortCode } = req.params;
    logger.info(`Attempting to redirect shortCode: ${shortCode}`);
    if (!shortCode) {
        throw new BadRequestError('Short code is required');
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fullShortUrl = `${baseUrl}/${shortCode}`;
    let url = await Url.findOne({
        shortUrl: fullShortUrl,
        isActive: true
    });
    if (!url) {
        // DEBUG: Try alternative approaches
        const alternativeUrl = await Url.findOne({
            shortUrl: { $regex: `/${shortCode}$` }, // Ends with /shortCode
            isActive: true
        });
        if (!alternativeUrl) {
            logger.warn(`URL not found for shortCode: ${shortCode}`, {
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
    logger.info(`URL found for ${shortCode}:`, {
        id: url._id,
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
        isActive: url.isActive,
        singleUse: url.singleUse
    });
    // Check if URL has expired
    if (url.expireAt && url.expireAt < new Date()) {
        logger.warn(`Expired URL accessed: ${shortCode}`);
        return res.status(410).json({
            success: false,
            message: 'This URL has expired'
        });
    }
    // Check if single-use URL has already been used
    if (url.singleUse) {
        logger.warn(`Single-use URL already accessed: ${shortCode}`);
        return res.status(410).json({
            success: false,
            message: 'This single-use URL has already been accessed'
        });
    }
    // Extract click tracking data
    const clickData = extractClickData(req);
    // Track click asynchronously (don't block redirect)
    setImmediate(async () => {
        try {
            await incrementClick(url._id.toString(), {
                userId: url.user?.toString(),
                ...clickData
            });
            // Update URL document with total clicks and last accessed
            await Url.findByIdAndUpdate(url._id, {
                $inc: { totalClicks: 1 },
                $set: { lastClickedAt: new Date() }
            });
            logger.info(`Click tracked for shortCode: ${shortCode}`);
        }
        catch (error) {
            logger.error(`Error tracking click for ${shortCode}:`, error);
            // Don't fail the redirect if tracking fails
        }
    });
    // For single-use URLs, deactivate after first click
    if (url.singleUse) {
        setImmediate(async () => {
            try {
                await Url.findByIdAndUpdate(url._id, { isActive: false });
                logger.info(`Single-use URL deactivated: ${shortCode}`);
            }
            catch (error) {
                logger.error(`Error deactivating single-use URL ${shortCode}:`, error);
            }
        });
    }
    // Redirect to original URL
    logger.info(`Redirecting ${shortCode} to ${url.longUrl}`);
    res.redirect(301, url.longUrl);
});
