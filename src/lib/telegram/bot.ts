/**
 * Telegram Bot Integration - Legacy Wrapper
 * 
 * This file maintains backward compatibility while delegating
 * to the new TelegramBotManager for improved load balancing
 */

import TelegramBot from 'node-telegram-bot-api';
import {
    uploadToTelegram as uploadViaManager,
    getTelegramFileLink as getFileLinkViaManager,
    deleteMessage as deleteViaManager,
    telegramBotManager // Export instance for direct access to new methods
} from './bot-manager';

export { telegramBotManager };

/**
 * Optimized Upload: Returns message + bot name
 */
export async function uploadToTelegramWithMeta(buffer: Buffer, filename: string) {
    return await telegramBotManager.uploadToTelegramWithMeta(buffer, filename);
}

/**
 * Optimized Retrieval: Get link from specific bot
 */
export async function getFileLinkFromBot(botName: string, fileId: string) {
    return await telegramBotManager.getFileLinkFromBot(botName, fileId);
}

// Legacy single bot support (for backward compatibility)
const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN_1;
const channelId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHANNEL_ID_1;

if (!token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN is not defined. Using bot manager with configured bots.');
}

// Create a fallback bot instance (backward compatibility)
export const bot = token ? new TelegramBot(token, { polling: false }) : null;

/**
 * Upload file to Telegram with automatic load balancing
 * Uses BotManager for intelligent bot selection
 */
export async function uploadToTelegram(buffer: Buffer, filename: string): Promise<TelegramBot.Message> {
    try {
        // Use the bot manager for load-balanced upload
        return await uploadViaManager(buffer, filename);
    } catch (error) {
        console.error('Error uploading to Telegram:', error);
        throw error;
    }
}

/**
 * Get Telegram file download link
 */
export async function getTelegramFileLink(fileId: string): Promise<string | null> {
    try {
        return await getFileLinkViaManager(fileId);
    } catch (error) {
        console.error('Error getting file link:', error);
        return null;
    }
}

/**
 * Get Telegram file stream (returns download link)
 */
export async function getTelegramFileStream(fileId: string) {
    try {
        const fileLink = await getFileLinkViaManager(fileId);
        return fileLink;
    } catch (error) {
        console.error('Error getting file stream:', error);
        return null;
    }
}

/**
 * Delete message from Telegram
 */
export async function deleteMessage(chatId: string | number, messageId: number) {
    try {
        return await deleteViaManager(chatId, messageId);
    } catch (error: any) {
        if (!error.message?.includes('message to delete not found')) {
            console.error('Error deleting from Telegram:', error);
        }
        return false;
    }
}

