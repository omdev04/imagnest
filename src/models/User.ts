import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    googleId?: string;
    telegramId?: string;
    email?: string;
    username: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
    apiKeys: string[];
    createdAt: Date;
    lastLogin: Date;
    usage: {
        uploadsToday: number;
        totalImages: number;
        storageUsed: number;
    };
    // Admin fields
    role: 'user' | 'admin' | 'superadmin';
    status: 'active' | 'suspended' | 'banned';
    warnings: number;
    strikes: number;
    suspendedUntil?: Date;
    banReason?: string;
    bannedAt?: Date;
    bannedBy?: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, sparse: true, unique: true },
    telegramId: { type: String, sparse: true, unique: true },
    email: { type: String, sparse: true },
    username: { type: String, required: true },
    avatar: { type: String },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    apiKeys: [{ type: String }],
    usage: {
        uploadsToday: { type: Number, default: 0 },
        totalImages: { type: Number, default: 0 },
        storageUsed: { type: Number, default: 0 } // in bytes
    },
    // Admin fields
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    warnings: { type: Number, default: 0 },
    strikes: { type: Number, default: 0 },
    suspendedUntil: { type: Date },
    banReason: { type: String },
    bannedAt: { type: Date },
    bannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastLogin: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// Reset daily uploads script would run via cron/scheduled task
// UserSchema.methods.resetDailyUsage = ...

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
