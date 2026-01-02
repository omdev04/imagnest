import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAbuseReport extends Document {
    imageId: mongoose.Types.ObjectId;
    reportedBy?: mongoose.Types.ObjectId;
    reason: 'sexual' | 'child_unsafe' | 'violence' | 'illegal' | 'copyright' | 'spam' | 'other';
    description?: string;
    status: 'pending' | 'approved' | 'ignored' | 'resolved';
    resolvedBy?: mongoose.Types.ObjectId;
    resolution?: string;
    createdAt: Date;
    resolvedAt?: Date;
}

const AbuseReportSchema: Schema = new Schema({
    imageId: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: {
        type: String,
        enum: ['sexual', 'child_unsafe', 'violence', 'illegal', 'copyright', 'spam', 'other'],
        required: true
    },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'ignored', 'resolved'],
        default: 'pending'
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
    resolvedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes
AbuseReportSchema.index({ imageId: 1 });
AbuseReportSchema.index({ status: 1, createdAt: -1 });

const AbuseReport: Model<IAbuseReport> = mongoose.models.AbuseReport || mongoose.model<IAbuseReport>('AbuseReport', AbuseReportSchema);

export default AbuseReport;
