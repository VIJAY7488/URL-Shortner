import { Response, Request } from "express";
import { nanoid } from "nanoid";
import Url from "../models/urlModel";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import QRCode from 'qrcode';
import { validateUrl } from "../utils/validator";
import { calculateUrlExpiry } from "../utils/ calculateUrlExpiry";


export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}


export const publicShortenUrl = wrapAsyncFunction(async(req: Request, res: Response) => {
    logger.info('public shorten url endpoint hit');

    const { error } = validateUrl(req.body);
    if(error){
        logger.error(`Validation Error: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { longUrl } = req.body;

    if (!longUrl) {
       throw new errorHandler.BadRequestError('"longUrl is required"')
    }

    // Check how many times this longUrl has been shortened before
    const existingUrls = await Url.find({ longUrl });

    if (existingUrls.length >= 5) {
        logger.warn(`Rate limit hit for longUrl: ${longUrl}`);
        return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: Cannot shorten the same URL more than 5 times.',
        });
    }

    // generate short code with nanoid
    const shortCode = nanoid(7);
    const fullShortUrl = `${process.env.MY_URL}/${shortCode}`;

    // Generate QR code (as base64 PNG string)
    const qrCode = await QRCode.toDataURL(fullShortUrl);

    const newUrl = await Url.create({
        longUrl,
        shortUrl: fullShortUrl,
        qrcode: qrCode
    });

    logger.info('public short url created successfully');
    res.status(201).json({
        success: true,
        ...newUrl.toObject(),
        qrCode
    });
});


export const userShortenUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('user shorten url endpoint hit');

    const { longUrl, customUrl, alias, expireAt, passwordProtected, singleUse, } = req.body;

    if (!longUrl) {
        throw new errorHandler.BadRequestError('longUrl is required');
    }

    const userId = req.user?.userId;

    logger.info(`userId: ${userId}`)

    if(!userId){
        throw new errorHandler.UnauthorizedError('Unauthorized: userId missing')
    }

    // check if longUrl already exists for the same user
    const existingUrl = await Url.findOne({ longUrl, user: userId });
    if (existingUrl) {
      throw new errorHandler.ConflictError('URL already shortened by this user');
    };
    
    let shortCode, qrCode;

    if (customUrl && alias) {
        shortCode = `${customUrl}/${alias}`;
    } else if (customUrl) {
        shortCode = `${customUrl}`;
    } else {
        const nanoCode = nanoid(7);
        shortCode = `${process.env.MY_URL}/${nanoCode}`;
    }
    
    qrCode = await QRCode.toDataURL(shortCode);

    const expireDate = await calculateUrlExpiry(expireAt);
    logger.info(`Expire date is: ${expireDate}`);

    const newUrl = await new Url({
        longUrl,
        shortUrl: shortCode,
        user: userId,
        expireAt: expireDate,
        qrcode: qrCode,
        singleUse: singleUse || false,
        isActive: true
    });

    await newUrl.save();

    logger.info('user short url created successfully');
    res.status(201).json({
        success: true,
        ...newUrl.toObject(),
        qrCode
    });
});


export const customUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('custom shorten url endpoint hit');

    const { longUrl, customUrl, alias, expireAt, passwordProtected } = req.body;
    
    if(!longUrl){
        throw new errorHandler.BadRequestError('longUrl is required');
    };
    if(!customUrl){
        throw new errorHandler.BadRequestError('customUrl is required');
    };

   const userId = req.user?.userId;

    logger.info(`userId: ${userId}`)

    if(!userId){
        throw new errorHandler.UnauthorizedError('Unauthorized: userId missing')
    }


    // check if longUrl already exists for the same user
    const existingUrl = await Url.findOne({ longUrl, user: userId });
    if (existingUrl) {
      throw new errorHandler.ConflictError('URL already shortened by this user');
    };

    // generate short code 
    const shortCode = `${customUrl}/${alias}`;

    //Generate QR code
    const qrCode = await QRCode.toDataURL(shortCode);

    
    const newUrl = new Url({
        longUrl,
        shortUrl: shortCode
    });

    logger.info('custom url created successfully');
    res.status(201).json({
        success: true,
        ...newUrl.toObject(),
        qrCode
    });

});


export const getAllUserUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('get all user url endpoint hit');

    const userId = req.user?.userId;

    logger.info(`userId: ${userId}`)

    if(!userId){
        throw new errorHandler.UnauthorizedError('Unauthorized: userId missing')
    };

    const allUrls = await Url.find({ user: userId }).sort({ createdAt: -1 });


    logger.info('All url get successfully');

    res.status(201).json({success: true, allUrls});

});