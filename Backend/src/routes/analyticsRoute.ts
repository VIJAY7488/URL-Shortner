import express from 'express';
import { getClicksBreakdown, getDailyClicks, getTotalClicksForUser } from '../controller/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();


router.get('/daily/:shortId', authenticate, getDailyClicks);
router.get('/total-clicks/:userId', authenticate, getTotalClicksForUser);
router.get("/breakdown/:shortUrlId", authenticate, getClicksBreakdown);

export default router;