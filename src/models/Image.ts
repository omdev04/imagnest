import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IImage extends Document {
    userId: mongoose.Types.ObjectId;
    telegramFileId: string;
    telegramFileUniqueId: string;
    telegramMessageId?: number;
    telegramChatId?: number;
    originalName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    privacy: 'public' | 'private';
    accessToken?: string;
    tokenGeneratedAt?: Date;
    accessCount: number;
    views: number;
    hash: string;
    metadata: Record<string, any>;
    createdAt: Date;
    // Moderation fields
    reports: number;
    moderationStatus: 'pending' | 'approved' | 'flagged' | 'removed';
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    uploadedByBot?: string; // Optimizaton: Know which bot uploaded the file
}

const ImageSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    telegramFileId: { type: String, required: true },
    telegramFileUniqueId: { type: String, required: true },
    telegramMessageId: { type: Number },
    telegramChatId: { type: Number },
    uploadedByBot: { type: String }, // Stores 'bot-1', 'bot-2', etc.
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    accessToken: { type: String, default: null },
    tokenGeneratedAt: { type: Date, default: null },
    accessCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    hash: { type: String },
    metadata: { type: Map, of: String },
    // Moderation fields
    reports: { type: Number, default: 0 },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'flagged', 'removed'],
        default: 'approved'
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date }
}, {
    timestamps: true
});

const Image: Model<IImage> = mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);

export default Image;
