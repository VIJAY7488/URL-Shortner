import { Response, Request } from "express";
import { nanoid } from "nanoid";
import Url from "../models/urlModel";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";
import QRCode from 'qrcode';
import { validateUrl } from "../utils/validator";
import { calculateUrlExpiry } from "../utils/ calculateUrlExpiry";
import { AuthFailureError, BadRequestError, ConflictError, NotFoundError } from "../utils/apiError";


export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}


// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const generateShortCode = (customUrl?: string, alias?: string): string => {
    if (customUrl && alias) {
        return `${customUrl}/${alias}`;
    } else if (customUrl) {
        return customUrl;
    } else {
        const nanoCode = nanoid(7);
        return nanoCode; // Just the code, not the full URL
    }
};

const buildFullUrl = (shortCode: string): string => {
    return `${process.env.MY_URL}/${shortCode}`;
};

const generateQRCode = async (url: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    } catch (error) {
        logger.error('QR Code generation failed:', error);
        throw new BadRequestError('Failed to generate QR code');
    }
};



// =====================================================
// PUBLIC URL SHORTENING
// =====================================================

export const publicShortenUrl = wrapAsyncFunction(async(req: Request, res: Response) => {
    logger.info('public shorten url endpoint hit');

    const { error } = validateUrl(req.body);
    if(error){
        logger.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { longUrl } = req.body;

    if (!longUrl) {
       throw new BadRequestError('"longUrl is required"')
    }

    // Rate limiting: Check how many times this longUrl has been shortened
    const urlCount = await Url.countDocuments({ longUrl });

    if (urlCount >= 5) {
        logger.warn(`Rate limit hit for longUrl: ${longUrl}`);
        return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: Cannot shorten the same URL more than 5 times.',
        });
    }



    // Generate new short URL
    const shortCode = generateShortCode();
    const fullShortUrl = buildFullUrl(shortCode);
    const qrCode = await generateQRCode(fullShortUrl);

    const newUrl = await Url.create({
        longUrl,
        shortUrl: fullShortUrl,
        qrcode: qrCode
    });

    logger.info(`Public short URL created: ${shortCode}`);
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

export const userShortenUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('user shorten url endpoint hit');


    const { title, longUrl, customUrl, expireAt, passwordProtected, passwordForUrl, singleUse, } = req.body;

    if (!longUrl) {
        throw new BadRequestError('longUrl is required');
    }

    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthFailureError('Unauthorized: userId missing');
    }

    // Validation for URL format
    const { error } = validateUrl(longUrl);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }


    // Check if user has already shortened this URL
    const existingUrl = await Url.findOne({ longUrl, user: userId });
    if (existingUrl) {
        logger.info('User already has this URL shortened');
        return res.status(200).json({
            success: true,
            message: 'URL already shortened by this user',
            data: existingUrl
        });
    }

    // Check if custom alias is already taken
    if (customUrl) {
        const customCode = generateShortCode(customUrl);
        const existingCustom = await Url.findOne({ shortCode: customCode });
        if (existingCustom) {
            throw new ConflictError('Custom URL/alias is already taken');
        }
    }


    // Generate URLs and QR code
    const shortCode = generateShortCode(customUrl);
    const fullShortUrl = buildFullUrl(shortCode);
    const qrCode = await generateQRCode(fullShortUrl);
    const expireDate = expireAt ? calculateUrlExpiry(expireAt) : null;

    

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

    const newUrl = await Url.create(urlData);

    logger.info(`User short URL created: ${shortCode} for user: ${userId}`);
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

export const getAllUserUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('Get all user URLs endpoint hit');

    const userId = req.user?.userId;

    logger.info(`userId: ${userId}`)

    if (!userId) {
        throw new AuthFailureError('Unauthorized: userId missing');
    }


    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Search and filter parameters
    const search = req.query.search as string;
    const status = req.query.status as string; // 'active', 'expired', 'all'
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query: any = { user: userId };

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
    } else if (status === 'expired') {
        query.expireAt = { $lte: new Date() };
    }

    // Execute queries in parallel
    const [urls, totalCount] = await Promise.all([
        Url.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('title longUrl user shortUrl shortCode totalClicks createdAt expireAt isActive singleUse')
            .lean(),
        Url.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info(`Retrieved ${urls.length} URLs for user ${userId}`);

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
export const deleteUrl = wrapAsyncFunction(async (req: AuthenticatedRequest, res: Response) => {
    logger.info('Delete URL endpoint hit');

    const { urlId } = req.params;


    if (!urlId) {
        logger.error('URL id not found in params');
        return res.status(400).json({
            success: false,
            message: 'URL id is required',
        });
    }


    const deletedUrl = await Url.findOneAndDelete({ 
        _id: urlId,  
    });

    if (!deletedUrl) {
        throw new NotFoundError('URL not found');
    }

    logger.info(`URL deleted: ${urlId}`);

    res.status(200).json({
        success: true,
        message: 'URL deleted successfully'
    });
});