import express from 'express';
import { getClicksBreakdown, getUrlAnalytics, getTotalClicksOfUser } from '../controller/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();


router.get('/daily/:shortId', authenticate, getUrlAnalytics);
router.get('/total-clicks/:userId', authenticate, getTotalClicksOfUser);
router.get("/breakdown/:shortUrlId", authenticate, getClicksBreakdown);

export default router;