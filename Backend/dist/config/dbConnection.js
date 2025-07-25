"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }
    try {
        await mongoose_1.default.connect(dbURI);
        logger_1.default.info("MongoDB connected successfully");
        mongoose_1.default.connection.on("error", (err) => {
            logger_1.default.error(`MongoDB connection error: ${err.message}`);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            logger_1.default.warn("MongoDB connection disconnected");
        });
        mongoose_1.default.connection.on("reconnected", () => {
            logger_1.default.info("MongoDB connection reestablished");
        });
    }
    catch (err) {
        logger_1.default.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};
exports.default = connectDB;
