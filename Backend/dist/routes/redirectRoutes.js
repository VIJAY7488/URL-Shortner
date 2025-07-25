"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userUrlServices_1 = require("../services/userUrlServices");
const router = express_1.default.Router();
router.get('/:shortCode', userUrlServices_1.redirectUrl);
exports.default = router;
