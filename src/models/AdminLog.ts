import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    targetType: 'user' | 'image' | 'report' | 'system';
    targetId?: mongoose.Types.ObjectId;
    details: string;
    ip?: string;
    timestamp: Date;
}

const AdminLogSchema: Schema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: {
        type: String,
        enum: ['user', 'image', 'report', 'system'],
        required: true
    },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: String, required: true },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// Index for faster queries
AdminLogSchema.index({ adminId: 1, timestamp: -1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });

const AdminLog: Model<IAdminLog> = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;
