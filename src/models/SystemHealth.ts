import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemHealth extends Document {
    telegramBotStatus: 'up' | 'down' | 'warning';
    telegramChannelStatus: 'up' | 'down' | 'warning';
    cdnStatus: 'up' | 'down' | 'warning';
    dbStatus: 'up' | 'down' | 'warning';
    cacheStatus: 'up' | 'down' | 'warning';
    serverMetrics: {
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
    };
    uptime: number; // in seconds
    lastChecked: Date;
    errorMessages?: string[];
}

const SystemHealthSchema: Schema = new Schema({
    telegramBotStatus: {
        type: String,
        enum: ['up', 'down', 'warning'],
        default: 'up'
    },
    telegramChannelStatus: {
        type: String,
        enum: ['up', 'down', 'warning'],
        default: 'up'
    },
    cdnStatus: {
        type: String,
        enum: ['up', 'down', 'warning'],
        default: 'up'
    },
    dbStatus: {
        type: String,
        enum: ['up', 'down', 'warning'],
        default: 'up'
    },
    cacheStatus: {
        type: String,
        enum: ['up', 'down', 'warning'],
        default: 'up'
    },
    serverMetrics: {
        cpuUsage: { type: Number },
        memoryUsage: { type: Number },
        diskUsage: { type: Number }
    },
    uptime: { type: Number, default: 0 },
    lastChecked: { type: Date, default: Date.now },
    errorMessages: [{ type: String }]
});

const SystemHealth: Model<ISystemHealth> = mongoose.models.SystemHealth || mongoose.model<ISystemHealth>('SystemHealth', SystemHealthSchema);

export default SystemHealth;
