"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = require("../controller/analyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/daily/:shortId', authMiddleware_1.authenticate, analyticsController_1.getUrlAnalytics);
router.get('/total-clicks/:userId', authMiddleware_1.authenticate, analyticsController_1.getTotalClicksOfUser);
router.get("/breakdown/:shortUrlId", authMiddleware_1.authenticate, analyticsController_1.getClicksBreakdown);
exports.default = router;
