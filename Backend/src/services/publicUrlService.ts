import { Request, Response } from 'express';
import Url from '../models/urlModel';
import wrapAsyncFunction from '../utils/tryCatchWrapper';
import logger from '../utils/logger';
import errorHandler from '../utils/errorHandler';


export const redirectPublicUrlToLongUrl = wrapAsyncFunction(async(req: Request, res: Response) => {
    logger.info('Public URL redirect endpoint accessed');

    const shortCode = req.params.shortUrl?.trim();

    if(!shortCode){
        throw new errorHandler.NotFoundError('Short URL does not get');
    };

    const urlDoc = await Url.findOne({
        $or: [
            { shortUrl: shortCode },
            { shortUrl: `${process.env.MY_URL}/${shortCode}` }
        ]
    });
    
    if (!urlDoc) {
        logger.warn(`Short URL not found: ${shortCode}`);
        throw new errorHandler.NotFoundError('Short URL not found');
    }

    logger.info(`Redirecting: ${shortCode} → ${urlDoc.longUrl}`);
    return res.redirect(302, urlDoc.longUrl);
});