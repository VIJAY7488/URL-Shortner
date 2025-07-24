import express from 'express';
import { deleteUrl, getAllUserUrl, publicShortenUrl, userShortenUrl } from '../controller/urlController';
import { authenticate } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/public-url', publicShortenUrl);
router.post('/user-url', authenticate, userShortenUrl);
router.get('/get-all-user-url', authenticate, getAllUserUrl);
router.delete('/delete-url/:urlId', deleteUrl);
export default router;
