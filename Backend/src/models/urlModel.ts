import mongoose, { Schema, Types } from "mongoose";

interface urlSchemaProps {
    longUrl: string,
    shortUrl: string,
    clicks: number,
    user: Types.ObjectId,
    createdAt: Date
}

const urlSchema = new Schema<urlSchemaProps>({
    longUrl: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    shortUrl: {
        type: Schema.Types.String,
        required: true
    },
    clicks: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Schema.Types.Date,
        default: Date.now
    }
}, {timestamps: true});


const Url = mongoose.model('Url', urlSchema);

export default Url;