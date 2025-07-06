import { Response, Request } from "express";
import { nanoid } from "nanoid";
import Url from "../models/urlModel";
import wrapAsyncFunction from "../utils/tryCatchWrapper";
import logger from "../utils/logger";
import errorHandler from "../utils/errorHandler";


export const publicShortenUrl = wrapAsyncFunction(async(req: Request, res: Response) => {
    logger.info('public sgorten url endpoint hit');

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
    // const fullShortUrl = `${process.env.MY_URL}/${shortCode}`;

    const newUrl = await Url.create({
        longUrl,
        shortUrl: shortCode
    });

    logger.info('public short url created successfully');
    res.status(201).json(newUrl);
})
