import Url from '../models/urlModel';
import wrapAsyncFunction from '../utils/tryCatchWrapper';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/apiError';
export const redirectPublicUrlToLongUrl = wrapAsyncFunction(async (req, res) => {
    logger.info('Public URL redirect endpoint accessed');
    const shortCode = req.params.shortUrl?.trim();
    if (!shortCode) {
        throw new NotFoundError('Short URL does not get');
    }
    ;
    const urlDoc = await Url.findOne({
        $or: [
            { shortUrl: shortCode },
            { shortUrl: `${process.env.MY_URL}/${shortCode}` }
        ]
    });
    if (!urlDoc) {
        logger.warn(`Short URL not found: ${shortCode}`);
        throw new NotFoundError('Short URL not found');
    }
    logger.info(`Redirecting: ${shortCode} → ${urlDoc.longUrl}`);
    return res.redirect(302, urlDoc.longUrl);
});
