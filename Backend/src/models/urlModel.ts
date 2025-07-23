import mongoose, { Schema, Types } from "mongoose";


interface urlSchemaProps {
    title: string,
    longUrl: string,
    shortcode: string,
    shortUrl: string,
    totalClicks: number,
    qrcode?: string,
    user?: Types.ObjectId,
    customUrl: string,
    singleUse: boolean,
    expireAt?: Date,
    passwordForUrl: string
    isActive: boolean
}

const urlSchema = new Schema<urlSchemaProps>({
    title: {
        type: String,
        trim: true
    },
    longUrl: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    shortcode: {
        type: String
    },
    shortUrl: {
        type: Schema.Types.String,
        required: true
    },
    qrcode: {
        type: Schema.Types.String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    customUrl: {
        type: Schema.Types.String,
        sparse: true,
    },
    singleUse: {
        type: Schema.Types.Boolean,
        default: false
    },
    passwordForUrl: {
        type: String,
        select: false
    },
    expireAt: {
        type: Schema.Types.Date,
        index: { expires: 0}
    },
    isActive: {
        type: Schema.Types.Boolean,
        default: true
    },
    totalClicks: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

urlSchema.index({ shortUrl: 1 }, { unique: true });
urlSchema.index({ user: 1 });


const Url = mongoose.model<urlSchemaProps>('Url', urlSchema);

export default Url;