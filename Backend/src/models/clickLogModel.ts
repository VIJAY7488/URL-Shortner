import mongoose, { Schema, Types } from "mongoose";

interface clickSchemaProps {
    shortUrl: Types.ObjectId;     
    user?: Types.ObjectId;   
    timestamp: Date;              
    count: number;  
    browser?: string,
    os?: string,
    deviceType?: string,
    ipHash?: string,
    country?: string,
    city?: string,
    referer?: string,     // Traffic source
    userAgent?: string,
    isBot?: boolean,     // Bot detection
    utm_source?: string,
    utm_medium?: string,
    utm_campaign?: string,
    utm_term?: string,
    utm_content?: string
}

const clickSchema = new Schema<clickSchemaProps>({
    shortUrl: {
        type: Schema.Types.ObjectId,
        ref: 'Url',
        required: true,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true     // Added index for time-based queries
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
        index: true    // For unique visitor tracking
    },
    country: {
        type: String,
        maxlength: 100,
        index: true,   // For geographic analysis
    },
    city: {
        type: String,
        maxlength: 100
    },
    referer: {
        type: String,
        maxlength: 500,
        index: true,   // For traffic source analysis
    },
    userAgent: {
        type: String,
        maxlength: 1000,
    },
    isBot: {
        type: Boolean,
        default: false,
        index: true     // To filter out bot traffic
    },
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String

}, {timestamps: true, collection: 'clicks'});


//Indexes
clickSchema.index({ shortUrl: 1, timestamp: 1 });
clickSchema.index({ user: 1, timestamp: 1 });
clickSchema.index({ shortUrl: 1, ipHash: 1 });
clickSchema.index({ country: 1, timestamp: 1 });
clickSchema.index({ timestamp: -1 });   // For recent activity queries
clickSchema.index({ isBot: 1, timestamp: 1 });


// TTL index for automatic data cleanup (optional - removes data after 2 years)
clickSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });


const Click = mongoose.model<clickSchemaProps>('Click', clickSchema);

export default Click;
export { clickSchemaProps };
