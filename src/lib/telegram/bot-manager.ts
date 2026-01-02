import TelegramBot from 'node-telegram-bot-api';

// Bot Configuration Interface
interface BotConfig {
    token: string;
    channelId: string;
    name: string;
    instance?: TelegramBot | null;
}

// Bot Health Status
interface BotHealth {
    isHealthy: boolean;
    lastCheck: number;
    consecutiveFailures: number;
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
    totalResponseTime: number;
}

// Bot Manager Class - Singleton Pattern
class TelegramBotManager {
    private bots: BotConfig[] = [];
    private botHealth: Map<string, BotHealth> = new Map();
    private currentBotIndex: number = 0;
    private readonly MAX_FAILURES = 3;
    private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
    private readonly HIGH_TRAFFIC_THRESHOLD = 100; // requests per minute
    private healthCheckTimer?: NodeJS.Timeout;

    // Simulation Mode for Testing
    private simulatedFailures: Set<string> = new Set();

    constructor() {
        this.initializeBots();

        // Start health check loop
        this.startHealthCheck();
    }

    /**
     * SIMULATION: Simulate a bot failure (Admin Only)
     */
    simulateFailure(botName: string, active: boolean) {
        if (active) {
            this.simulatedFailures.add(botName);
            // Immediately mark as unhealthy
            const health = this.botHealth.get(botName);
            if (health) {
                health.isHealthy = false;
                health.errorCount++;
                console.log(`🧪 SIMULATION: ${botName} failure detected!`);
            }
        } else {
            this.simulatedFailures.delete(botName);
            // Trigger immediate health check to restore
            this.performHealthChecks();
            console.log(`🧪 SIMULATION: ${botName} failure cleared.`);
        }
    }

    /**
     * Initialize all configured bots
     */
    private initializeBots() {
        // Bot 1: Try legacy naming first (TELEGRAM_BOT_TOKEN), then _1 suffix
        let bot1Token = process.env.TELEGRAM_BOT_TOKEN_1;
        let bot1Channel = process.env.TELEGRAM_CHANNEL_ID_1;

        // Fallback to legacy naming if _1 not found
        if (!bot1Token || !bot1Channel) {
            bot1Token = process.env.TELEGRAM_BOT_TOKEN;
            bot1Channel = process.env.TELEGRAM_CHANNEL_ID;
        }

        // Bot 2: Only check _2 suffix
        const bot2Token = process.env.TELEGRAM_BOT_TOKEN_2;
        const bot2Channel = process.env.TELEGRAM_CHANNEL_ID_2;

        console.log('🔍 Bot Manager Initialization:');
        console.log('  Bot 1 Token:', bot1Token ? '✅ Set' : '❌ Missing');
        console.log('  Bot 1 Channel:', bot1Channel ? '✅ Set' : '❌ Missing');
        console.log('  Bot 2 Token:', bot2Token ? '✅ Set' : '❌ Missing');
        console.log('  Bot 2 Channel:', bot2Channel ? '✅ Set' : '❌ Missing');

        // Initialize Bot 1
        if (bot1Token && bot1Channel) {
            const bot1: BotConfig = {
                token: bot1Token,
                channelId: bot1Channel,
                name: 'bot-1',
                instance: new TelegramBot(bot1Token, { polling: false })
            };
            this.bots.push(bot1);
            this.botHealth.set('bot-1', this.createHealthStatus());
            console.log('✅ Bot 1 initialized successfully');
        } else {
            console.log('⚠️  Bot 1 skipped - missing token or channel ID');
        }

        // Initialize Bot 2
        if (bot2Token && bot2Channel) {
            const bot2: BotConfig = {
                token: bot2Token,
                channelId: bot2Channel,
                name: 'bot-2',
                instance: new TelegramBot(bot2Token, { polling: false })
            };
            this.bots.push(bot2);
            this.botHealth.set('bot-2', this.createHealthStatus());
            console.log('✅ Bot 2 initialized successfully');
        } else {
            console.log('⚠️  Bot 2 skipped - missing token or channel ID');
        }

        if (this.bots.length === 0) {
            console.warn('❌ No Telegram bots configured. Upload functionality will be unavailable.');
        } else {
            console.log(`✅ Initialized ${this.bots.length} Telegram bot(s)`);
        }
    }

    /**
     * Create initial health status
     */
    private createHealthStatus(): BotHealth {
        return {
            isHealthy: true,
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            requestCount: 0,
            errorCount: 0,
            avgResponseTime: 0,
            totalResponseTime: 0,
        };
    }

    /**
     * Start periodic health checks
     */
    private startHealthCheck() {
        this.healthCheckTimer = setInterval(() => {
            this.performHealthChecks();
        }, this.HEALTH_CHECK_INTERVAL);
    }

    /**
     * Perform health checks on all bots
     */
    private async performHealthChecks() {
        for (const bot of this.bots) {
            const health = this.botHealth.get(bot.name);
            if (!health) continue;

            // SIMULATION CHECK
            if (this.simulatedFailures.has(bot.name)) {
                health.consecutiveFailures++;
                health.lastCheck = Date.now();
                health.isHealthy = false;
                console.log(`🧪 SIMULATION: Bot ${bot.name} check failed (Simulated)`);
                continue;
            }

            try {
                const startTime = Date.now();
                // Simple health check - try to get bot info
                await bot.instance?.getMe();
                const responseTime = Date.now() - startTime;

                // Update health status
                health.isHealthy = true;
                health.consecutiveFailures = 0;
                health.lastCheck = Date.now();

                // console.log(`✅ Bot ${bot.name} is healthy (${responseTime}ms)`);
            } catch (error) {
                health.consecutiveFailures++;
                health.lastCheck = Date.now();

                if (health.consecutiveFailures >= this.MAX_FAILURES) {
                    health.isHealthy = false;
                    console.error(`❌ Bot ${bot.name} marked unhealthy after ${health.consecutiveFailures} failures`);
                }
            }
        }

        // Reset counters every minute for traffic monitoring
        this.resetTrafficCounters();
    }

    /**
     * Reset traffic counters for fresh metrics
     */
    private resetTrafficCounters() {
        for (const [name, health] of this.botHealth.entries()) {
            health.requestCount = 0;
            health.errorCount = 0;
            health.totalResponseTime = 0;
            health.avgResponseTime = 0;
        }
    }

    /**
     * Get next available bot using round-robin with health check
     */
    private getNextBot(): BotConfig | null {
        if (this.bots.length === 0) return null;

        // Try to find a healthy bot starting from current index
        let attempts = 0;
        while (attempts < this.bots.length) {
            const bot = this.bots[this.currentBotIndex];
            const health = this.botHealth.get(bot.name);

            // Check if bot is healthy and not overloaded
            if (health?.isHealthy && health.requestCount < this.HIGH_TRAFFIC_THRESHOLD) {
                // Move to next bot for next request (round-robin)
                this.currentBotIndex = (this.currentBotIndex + 1) % this.bots.length;
                return bot;
            }

            // Try next bot
            this.currentBotIndex = (this.currentBotIndex + 1) % this.bots.length;
            attempts++;
        }

        // If all bots are overloaded or unhealthy, return the least loaded one
        return this.getLeastLoadedBot();
    }

    /**
     * Get the bot with lowest traffic
     */
    private getLeastLoadedBot(): BotConfig | null {
        if (this.bots.length === 0) return null;

        let leastLoadedBot = this.bots[0];
        let lowestLoad = this.botHealth.get(leastLoadedBot.name)?.requestCount || Infinity;

        for (const bot of this.bots) {
            const health = this.botHealth.get(bot.name);
            if (health && health.isHealthy && health.requestCount < lowestLoad) {
                leastLoadedBot = bot;
                lowestLoad = health.requestCount;
            }
        }

        return leastLoadedBot;
    }

    /**
     * Upload file to Telegram with automatic load balancing
     */
    async uploadToTelegram(buffer: Buffer, filename: string): Promise<TelegramBot.Message> {
        const bot = this.getNextBot();

        if (!bot || !bot.instance) {
            throw new Error('No Telegram bots available');
        }

        const health = this.botHealth.get(bot.name);
        if (!health) {
            throw new Error('Bot health status unavailable');
        }

        const startTime = Date.now();
        let attempt = 0;
        const maxAttempts = this.bots.length;

        while (attempt < maxAttempts) {
            try {
                health.requestCount++;

                const fileOptions = {
                    filename: filename,
                    contentType: 'application/octet-stream',
                };

                const message = await bot.instance.sendDocument(
                    bot.channelId,
                    buffer,
                    {},
                    fileOptions
                );

                // Update metrics on success
                const responseTime = Date.now() - startTime;
                health.totalResponseTime += responseTime;
                health.avgResponseTime = health.totalResponseTime / health.requestCount;

                console.log(`✅ Uploaded to ${bot.name} (${responseTime}ms)`);

                return message;

            } catch (error) {
                health.errorCount++;
                health.consecutiveFailures++;

                console.error(`❌ Upload failed on ${bot.name}:`, error);

                // Mark as unhealthy if too many failures
                if (health.consecutiveFailures >= this.MAX_FAILURES) {
                    health.isHealthy = false;
                }

                // Try next bot
                attempt++;
                if (attempt < maxAttempts) {
                    const nextBot = this.getNextBot();
                    if (nextBot) {
                        console.log(`🔄 Switching to ${nextBot.name}`);
                        continue;
                    }
                }

                throw error;
            }
        }

        throw new Error('All bots failed to upload');
    }

    /**
     * Upload file and return message + bot name
     * Useful for tracking which bot owns the file
     */
    async uploadToTelegramWithMeta(buffer: Buffer, filename: string): Promise<{ message: TelegramBot.Message, botName: string }> {
        const bot = this.getNextBot();

        if (!bot || !bot.instance) {
            throw new Error('No Telegram bots available');
        }

        const health = this.botHealth.get(bot.name);
        if (!health) {
            throw new Error('Bot health status unavailable');
        }

        const startTime = Date.now();
        let attempt = 0;
        const maxAttempts = this.bots.length;

        while (attempt < maxAttempts) {
            try {
                health.requestCount++;

                const fileOptions = {
                    filename: filename,
                    contentType: 'application/octet-stream',
                };

                const message = await bot.instance.sendDocument(
                    bot.channelId,
                    buffer,
                    {},
                    fileOptions
                );

                // Update metrics on success
                const responseTime = Date.now() - startTime;
                health.totalResponseTime += responseTime;
                health.avgResponseTime = health.totalResponseTime / health.requestCount;

                console.log(`✅ Uploaded to ${bot.name} (${responseTime}ms)`);

                return { message, botName: bot.name };

            } catch (error) {
                health.errorCount++;
                health.consecutiveFailures++;

                console.error(`❌ Upload failed on ${bot.name}:`, error);

                // Mark as unhealthy if too many failures
                if (health.consecutiveFailures >= this.MAX_FAILURES) {
                    health.isHealthy = false;
                }

                // Try next bot
                attempt++;
                if (attempt < maxAttempts) {
                    const nextBot = this.getNextBot();
                    if (nextBot) {
                        console.log(`🔄 Switching to ${nextBot.name}`);
                        continue;
                    }
                }

                throw error;
            }
        }

        throw new Error('All bots failed to upload');
    }

    /**
     * Get file link from any available bot
     */
    async getTelegramFileLink(fileId: string): Promise<string | null> {
        for (const bot of this.bots) {
            const health = this.botHealth.get(bot.name);
            if (!health?.isHealthy || !bot.instance) continue;

            try {
                return await bot.instance.getFileLink(fileId);
            } catch (error) {
                console.error(`Failed to get file link from ${bot.name}:`, error);

                // If specific error "wrong file_id", we know this is the wrong bot
                // Just continue to next bot
                continue;
            }
        }

        return null;
    }

    /**
     * Optimized: Get file link from specific bot
     */
    async getFileLinkFromBot(botName: string, fileId: string): Promise<string | null> {
        const bot = this.bots.find(b => b.name === botName);
        if (!bot || !bot.instance) return null;

        try {
            return await bot.instance.getFileLink(fileId);
        } catch (error) {
            console.error(`Failed to get file link from ${botName}:`, error);
            // Fallback to searching all bots if specific one fails
            return this.getTelegramFileLink(fileId);
        }
    }

    /**
     * Delete message from Telegram
     */
    async deleteMessage(chatId: string | number, messageId: number): Promise<boolean> {
        // Try deletion with all bots (in case message is in different channel)
        for (const bot of this.bots) {
            if (!bot.instance) continue;

            try {
                await bot.instance.deleteMessage(chatId, messageId);
                return true;
            } catch (error: any) {
                if (!error.message?.includes('message to delete not found')) {
                    console.error(`Error deleting from ${bot.name}:`, error);
                }
            }
        }

        return false;
    }

    /**
     * Send text message via available bot
     */
    async sendMessage(text: string): Promise<boolean> {
        const bot = this.getNextBot();
        if (!bot || !bot.instance) {
            console.error('No Telegram bots available for sending message');
            return false;
        }

        try {
            await bot.instance.sendMessage(bot.channelId, text, { parse_mode: 'HTML' });
            return true;
        } catch (error) {
            console.error(`Failed to send message via ${bot.name}:`, error);
            return false;
        }
    }

    /**
     * Get bot statistics and health status
     */
    getBotStats() {
        const stats = Array.from(this.botHealth.entries()).map(([name, health]) => ({
            name,
            healthy: health.isHealthy,
            requestCount: health.requestCount,
            errorCount: health.errorCount,
            avgResponseTime: Math.round(health.avgResponseTime),
            lastCheck: new Date(health.lastCheck).toISOString(),
            consecutiveFailures: health.consecutiveFailures,
        }));

        return {
            totalBots: this.bots.length,
            healthyBots: stats.filter(s => s.healthy).length,
            bots: stats,
        };
    }

    /**
     * Manual failover to specific bot
     */
    switchToBot(botIndex: number) {
        if (botIndex >= 0 && botIndex < this.bots.length) {
            this.currentBotIndex = botIndex;
            console.log(`🔄 Manually switched to bot-${botIndex + 1}`);
        }
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }

        // Close all bot instances
        for (const bot of this.bots) {
            if (bot.instance) {
                bot.instance.stopPolling();
            }
        }
    }
}

// Singleton instance
let botManagerInstance: TelegramBotManager | null = null;

export function getBotManager(): TelegramBotManager {
    if (!botManagerInstance) {
        botManagerInstance = new TelegramBotManager();
    }
    return botManagerInstance;
}

// Export singleton instance for direct access
export const telegramBotManager = getBotManager();

// Export convenience functions
export async function uploadToTelegram(buffer: Buffer, filename: string): Promise<TelegramBot.Message> {
    return getBotManager().uploadToTelegram(buffer, filename);
}

export async function getTelegramFileLink(fileId: string): Promise<string | null> {
    return getBotManager().getTelegramFileLink(fileId);
}

export async function deleteMessage(chatId: string | number, messageId: number): Promise<boolean> {
    return getBotManager().deleteMessage(chatId, messageId);
}

export async function sendMessage(text: string): Promise<boolean> {
    return getBotManager().sendMessage(text);
}

export function getBotStats() {
    return getBotManager().getBotStats();
}
