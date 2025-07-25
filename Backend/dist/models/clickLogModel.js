"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const clickSchema = new mongoose_1.Schema({
    shortUrl: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Url',
        required: true,
        index: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true // Added index for time-based queries
    },
    count: {
        type: Number,
        default: 0,
        required: true,
        min: 0
    },
    browser: {
        type: String,
        trim: true,
        maxlength: 100
    },
    os: {
        type: String,
        trim: true,
        maxlength: 100
    },
    deviceType: {
        type: String,
        enum: ['Mobile', 'Desktop', 'Tablet', 'Unknown'],
        default: 'Unknown'
    },
    ipHash: {
        type: String,
        index: true // For unique visitor tracking
    },
    country: {
        type: String,
        maxlength: 100,
        index: true, // For geographic analysis
    },
    city: {
        type: String,
        maxlength: 100
    },
    referer: {
        type: String,
        maxlength: 500,
        index: true, // For traffic source analysis
    },
    userAgent: {
        type: String,
        maxlength: 1000,
    },
    isBot: {
        type: Boolean,
        default: false,
        index: true // To filter out bot traffic
    },
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String
}, { timestamps: true, collection: 'clicks' });
//Indexes
clickSchema.index({ shortUrl: 1, timestamp: 1 });
clickSchema.index({ user: 1, timestamp: 1 });
clickSchema.index({ shortUrl: 1, ipHash: 1 });
clickSchema.index({ country: 1, timestamp: 1 });
clickSchema.index({ timestamp: -1 }); // For recent activity queries
clickSchema.index({ isBot: 1, timestamp: 1 });
// TTL index for automatic data cleanup (optional - removes data after 2 years)
clickSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });
const Click = mongoose_1.default.model('Click', clickSchema);
exports.default = Click;
