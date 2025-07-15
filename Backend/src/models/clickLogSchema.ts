import { url } from "inspector";
import mongoose, { Schema, Types } from "mongoose";

interface clickSchemaProps {
    shortUrl: Types.ObjectId;     
    user?: Types.ObjectId;   
    date: Date;              
    count: number;  
    browser: string,
    os: string,
    deviceType: string         
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
    date: {
        type: Schema.Types.Date,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
        required: true
    },
    browser: String,
    os: String,
    deviceType: String,
});

clickSchema.index({ shortUrl: 1, date: 1 }, { unique: true });

const Click = mongoose.model('Click', clickSchema);

export default Click;
