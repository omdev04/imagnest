import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
    date: Date; // truncated to day or hour
    uploads: number;
    requests: number;
    bandwidth: number; // bytes
    cacheHits: number;
    cacheMisses: number;
    errorCount: number;
}

const AnalyticsSchema: Schema = new Schema({
    date: { type: Date, required: true, unique: true }, // Store daily stats
    uploads: { type: Number, default: 0 },
    requests: { type: Number, default: 0 },
    bandwidth: { type: Number, default: 0 },
    cacheHits: { type: Number, default: 0 },
    cacheMisses: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
