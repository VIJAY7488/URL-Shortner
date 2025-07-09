import { Response, Request } from "express";
import { nanoid } from "nanoid";
import Url from "../models/urlModel";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import { Types } from "mongoose";


export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}


export const publicShortenUrl = wrapAsyncFunction(async(req: Request, res: Response) => {
    logger.info('public shorten url endpoint hit');

    const { longUrl } = req.body;

    if (!longUrl) {
       throw new errorHandler.BadRequestError('"longUrl is required"')
    }

    //check if already exist
    const existingUrl = await Url.findOne({ longUrl });
    if(existingUrl){
        throw new errorHandler.ConflictError("URL already shortened");
    }

    // generate short code with nanoid
    const shortCode = nanoid(7);
    const fullShortUrl = `${process.env.MY_URL}/${shortCode}`;

    const newUrl = await Url.create({
        longUrl,
        shortUrl: fullShortUrl
    });

    logger.info('public short url created successfully');
    res.status(201).json(newUrl);
});


export const userShortenUrl = wrapAsyncFunction(async(req: AuthenticatedRequest, res: Response) => {
    logger.info('user shorten url endpoint hit');

    const { longUrl } = req.body;

    if (!longUrl) {
        throw new errorHandler.BadRequestError('longUrl is required');
    }

    const userId = req.user?.userId;

    logger.info(`userId: ${userId}`)

    if(!userId){
        throw new errorHandler.NotFoundError('user id is not found')
    }

    // check if longUrl already exists for the same user
    const existingUrl = await Url.findOne({ longUrl, user: userId });
    if (existingUrl) {
      throw new errorHandler.ConflictError('URL already shortened by this user');
    };

    const shortCode = nanoid(7);
    const fullShortUrl = `${process.env.MY_URL}/${shortCode}`;

    const newUrl = await new Url({
        longUrl,
        shortUrl: fullShortUrl,
        user: userId
    });

    await newUrl.save();

    logger.info('user short url created successfully');
    res.status(201).json(newUrl);
});


