import mongoose, { Schema, Document } from 'mongoose';

export interface IUploadChunk extends Document {
    uploadId: string;
    chunkIndex: number;
    data: Buffer;
    createdAt: Date;
}

const UploadChunkSchema = new Schema<IUploadChunk>({
    uploadId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    data: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete orphaned chunks after 1 hour
});

UploadChunkSchema.index({ uploadId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.models.UploadChunk || mongoose.model<IUploadChunk>('UploadChunk', UploadChunkSchema);
