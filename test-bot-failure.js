/**
 * Test Script: Simulate Bot Failure
 * 
 * This script helps test the bot failover mechanism by temporarily
 * corrupting one bot's token to simulate a failure scenario.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const backupPath = path.join(__dirname, '.env.backup');

console.log('🧪 Bot Failure Test Script\n');

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Check current state
const isBotCorrupted = envContent.includes('TELEGRAM_BOT_TOKEN_2_CORRUPTED');

if (isBotCorrupted) {
    // Restore original token
    console.log('🔄 Restoring Bot 2 token from backup...\n');

    if (!fs.existsSync(backupPath)) {
        console.error('❌ Error: No backup file found!');
        console.log('Manual restoration required.');
        process.exit(1);
    }

    // Restore from backup
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(envPath, backupContent);
    fs.unlinkSync(backupPath);

    console.log('✅ Bot 2 token restored successfully!');
    console.log('📝 Changes made:');
    console.log('   - Restored original TELEGRAM_BOT_TOKEN_2');
    console.log('   - Deleted backup file');
    console.log('\n⚠️  Restart dev server to apply changes:');
    console.log('   npm run dev');

} else {
    // Corrupt Bot 2 token
    console.log('💥 Corrupting Bot 2 token to simulate failure...\n');

    // Create backup first
    fs.writeFileSync(backupPath, envContent);
    console.log('✅ Backup created: .env.backup');

    // Find and corrupt Bot 2 token
    const bot2TokenMatch = envContent.match(/TELEGRAM_BOT_TOKEN_2=([^\n]+)/);

    if (!bot2TokenMatch) {
        console.error('❌ Error: TELEGRAM_BOT_TOKEN_2 not found in .env');
        fs.unlinkSync(backupPath);
        process.exit(1);
    }

    const originalToken = bot2TokenMatch[1];
    const corruptedToken = 'INVALID_TOKEN_' + Date.now();

    // Replace token with corrupted version
    envContent = envContent.replace(
        /TELEGRAM_BOT_TOKEN_2=([^\n]+)/,
        `TELEGRAM_BOT_TOKEN_2=${corruptedToken}\n# TELEGRAM_BOT_TOKEN_2_CORRUPTED=true # Original: ${originalToken}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('💥 Bot 2 token corrupted!');
    console.log('📝 Changes made:');
    console.log(`   - Original: ${originalToken.substring(0, 20)}...`);
    console.log(`   - Corrupted: ${corruptedToken}`);
    console.log('   - Backup saved to .env.backup');

    console.log('\n🧪 Test Scenario:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Go to: http://localhost:3000/admin/telegram-bots');
    console.log('   3. Wait 30 seconds for health check');
    console.log('   4. Observe:');
    console.log('      - Bot 2 should show as "Unhealthy" (red)');
    console.log('      - Healthy Bots count: 1 (only Bot 1)');
    console.log('      - Warning alert should appear');
    console.log('   5. Try uploading an image');
    console.log('      - Upload should work (failover to Bot 1)');
    console.log('      - All requests go to Bot 1 only');

    console.log('\n🔄 To restore:');
    console.log('   - Run this script again: node test-bot-failure.js');
    console.log('   - Or manually restore from .env.backup');
}

console.log('\n' + '='.repeat(60));
console.log('Current Status:');

// Show current config
const currentEnv = fs.readFileSync(envPath, 'utf8');
const bot1Token = currentEnv.match(/TELEGRAM_BOT_TOKEN=([^\n]+)/)?.[1];
const bot2Token = currentEnv.match(/TELEGRAM_BOT_TOKEN_2=([^\n]+)/)?.[1];

console.log(`Bot 1 Token: ${bot1Token ? bot1Token.substring(0, 15) + '...' : '❌ Missing'}`);
console.log(`Bot 2 Token: ${bot2Token ? bot2Token.substring(0, 15) + '...' : '❌ Missing'}`);
console.log(`Bot 2 Status: ${bot2Token && bot2Token.startsWith('INVALID') ? '💥 CORRUPTED (Test Mode)' : '✅ Valid'}`);
console.log('='.repeat(60) + '\n');
