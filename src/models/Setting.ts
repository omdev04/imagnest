import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    key: string;
    value: any; // Can be boolean, number, string, etc.
    updatedBy: Schema.Types.ObjectId;
    updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
