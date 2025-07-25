"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controller/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Route to register a new user
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.post('/refresh-token', authController_1.refreshTokenUser);
router.post('/logout', authController_1.logoutUser);
router.get('/get-user', authMiddleware_1.authenticate, authController_1.getUser);
// Export the router
exports.default = router;
