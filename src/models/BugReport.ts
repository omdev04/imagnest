import mongoose from 'mongoose';

const BugReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 5000
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    deviceInfo: {
        userAgent: String,
        platform: String,
        screenSize: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.BugReport || mongoose.model('BugReport', BugReportSchema);
