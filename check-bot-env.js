// Quick script to check Telegram bot environment variables
console.log('=== Telegram Bot Configuration Check ===\n');

// Bot 1 with fallback logic
let bot1Token = process.env.TELEGRAM_BOT_TOKEN_1;
let bot1Channel = process.env.TELEGRAM_CHANNEL_ID_1;
let bot1Source = '_1 suffix';

// Fallback to legacy
if (!bot1Token || !bot1Channel) {
    bot1Token = process.env.TELEGRAM_BOT_TOKEN;
    bot1Channel = process.env.TELEGRAM_CHANNEL_ID;
    bot1Source = 'legacy (no suffix)';
}

const bot2Token = process.env.TELEGRAM_BOT_TOKEN_2;
const bot2Channel = process.env.TELEGRAM_CHANNEL_ID_2;

console.log('Bot 1:');
console.log(`  Token: ${bot1Token ? '✅ Set (' + bot1Token.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`  Channel: ${bot1Channel ? '✅ Set (' + bot1Channel + ')' : '❌ Missing'}`);
console.log(`  Source: ${bot1Token ? bot1Source : 'N/A'}`);

console.log('\nBot 2:');
console.log(`  Token: ${bot2Token ? '✅ Set (' + bot2Token.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`  Channel: ${bot2Channel ? '✅ Set (' + bot2Channel + ')' : '❌ Missing'}`);
console.log(`  Source: ${bot2Token ? '_2 suffix' : 'N/A'}`);

console.log('\n=== Summary ===');
let configuredBots = 0;
if (bot1Token && bot1Channel) configuredBots++;
if (bot2Token && bot2Channel) configuredBots++;

console.log(`Configured Bots: ${configuredBots}`);

if (configuredBots === 0) {
    console.log('\n⚠️  WARNING: No bots configured!');
    console.log('Add these to your .env file:');
    console.log('');
    console.log('TELEGRAM_BOT_TOKEN=your_bot_1_token  (Bot 1)');
    console.log('TELEGRAM_CHANNEL_ID=your_bot_1_channel_id');
    console.log('TELEGRAM_BOT_TOKEN_2=your_bot_2_token');
    console.log('TELEGRAM_CHANNEL_ID_2=your_bot_2_channel_id');
} else if (configuredBots === 1) {
    console.log('\n⚠️  Only 1 bot configured. For load balancing, configure both bots.');
} else {
    console.log('\n✅ Both bots configured! Load balancing is active.');
}
