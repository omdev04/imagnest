import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "@/models/Image";
import Setting from "@/models/Setting";
import UploadChunk from "@/models/UploadChunk";
import { uploadToTelegram, uploadToTelegramWithMeta } from "@/lib/telegram/bot";
import { checkUploadLimit, incrementUsage } from "@/lib/upload/limits";
import { validateFile } from "@/lib/upload/validator";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // 0. Check Global Uploads Setting
        const uploadsSetting = await Setting.findOne({ key: 'uploadsEnabled' });
        if (uploadsSetting && uploadsSetting.value === false) {
            return NextResponse.json({ error: "Uploads are currently disabled by the administrator." }, { status: 503 });
        }

        let userId: string;

        // 1. Check for API Key first (for external tools)
        const apiKey = req.headers.get('x-api-key');
        if (apiKey) {
            await dbConnect();
            const user = await User.findOne({ apiKeys: apiKey });
            if (!user) {
                return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
            }
            userId = user._id.toString();
        } else {
            // 2. Fallback to Session (for dashboard)
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            // @ts-ignore
            userId = session.user.id;
        }

        // Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const privacy = formData.get('privacy') as string;
        const uploadId = formData.get('uploadId') as string | null;
        const chunkIndexStr = formData.get('chunkIndex') as string | null;
        const totalChunksStr = formData.get('totalChunks') as string | null;
        const totalSizeStr = formData.get('totalSize') as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const chunkIndex = parseInt(chunkIndexStr || '0', 10);
        const totalChunks = parseInt(totalChunksStr || '1', 10);
        const totalSize = parseInt(totalSizeStr || '0', 10) || file.size;

        // Validation
        const validation = validateFile(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        if (totalSize > 20 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 20MB limit" }, { status: 400 });
        }

        // Limit Check (using totalSize for accurate quota checks)
        const limitCheck = await checkUploadLimit(userId, totalSize);
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: limitCheck.error }, { status: 403 });
        }

        // Convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let finalBuffer = buffer;

        if (totalChunks > 1 && uploadId) {
            await dbConnect();
            await UploadChunk.findOneAndUpdate(
                { uploadId, chunkIndex },
                { $set: { uploadId, chunkIndex, data: buffer, createdAt: new Date() } },
                { upsert: true, new: true }
            );

            const count = await UploadChunk.countDocuments({ uploadId });
            if (count < totalChunks) {
                return NextResponse.json({
                    success: true,
                    chunkIndex,
                    received: count,
                    totalChunks,
                    status: "chunk_received"
                });
            }

            // All chunks received! Reassemble full Buffer
            const allChunks = await UploadChunk.find({ uploadId }).sort({ chunkIndex: 1 });
            finalBuffer = Buffer.concat(allChunks.map(c => c.data));

            // Clean up temporary chunks from DB
            await UploadChunk.deleteMany({ uploadId });
        }

        // Upload to Telegram with Bot Optimization
        // Returns both message and bot name to track which bot has the file
        const { message: telegramMsg, botName } = await uploadToTelegramWithMeta(finalBuffer, file.name);

        if (!telegramMsg.document && !telegramMsg.photo) {
            throw new Error("Telegram did not return a document or photo");
        }

        // Get File ID
        const fileId = telegramMsg.document?.file_id || telegramMsg.photo?.[telegramMsg.photo.length - 1]?.file_id;
        const uniqueId = telegramMsg.document?.file_unique_id || telegramMsg.photo?.[telegramMsg.photo.length - 1]?.file_unique_id;

        if (!fileId || !uniqueId) {
            throw new Error("Failed to get file ID from Telegram");
        }

        // Save to DB
        await dbConnect();
        const newImage = await Image.create({
            userId,
            telegramFileId: fileId,
            telegramFileUniqueId: uniqueId,
            telegramMessageId: telegramMsg.message_id,
            telegramChatId: telegramMsg.chat.id,
            uploadedByBot: botName, // Optimization: Save which bot uploaded this
            originalName: file.name,
            mimeType: file.type,
            size: totalSize,
            privacy: privacy === 'private' ? 'private' : 'public',
        });

        // Update Usage
        await incrementUsage(userId);

        return NextResponse.json({
            success: true,
            image: {
                id: newImage._id,
                url: `/i/${newImage._id}`,
                name: newImage.originalName,
                size: newImage.size,
                privacy: newImage.privacy
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
}
