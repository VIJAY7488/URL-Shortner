"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const urlController_1 = require("../controller/urlController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/public-url', urlController_1.publicShortenUrl);
router.post('/user-url', authMiddleware_1.authenticate, urlController_1.userShortenUrl);
router.get('/get-all-user-url', authMiddleware_1.authenticate, urlController_1.getAllUserUrl);
router.delete('/delete-url/:urlId', urlController_1.deleteUrl);
exports.default = router;
