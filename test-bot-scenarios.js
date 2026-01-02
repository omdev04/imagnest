/**
 * Advanced Bot Testing Script
 * Tests multiple failure scenarios
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const backupPath = path.join(__dirname, '.env.test-backup');

console.log('🧪 Advanced Bot Failure Testing\n');
console.log('Choose a test scenario:\n');
console.log('1. Corrupt Bot 1 token (test Bot 2 handles all traffic)');
console.log('2. Corrupt Bot 2 token (test Bot 1 handles all traffic)');
console.log('3. Corrupt Bot 2 channel ID (test invalid channel handling)');
console.log('4. Restore all bots to working state');
console.log('0. Exit\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter choice (0-4): ', (choice) => {
    console.log('');

    switch (choice) {
        case '1':
            corruptBot1Token();
            break;
        case '2':
            corruptBot2Token();
            break;
        case '3':
            corruptBot2Channel();
            break;
        case '4':
            restoreAllBots();
            break;
        case '0':
            console.log('👋 Exiting...');
            break;
        default:
            console.log('❌ Invalid choice');
    }

    rl.close();
});

function createBackup() {
    const content = fs.readFileSync(envPath, 'utf8');
    fs.writeFileSync(backupPath, content);
    console.log('✅ Backup created\n');
}

function corruptBot1Token() {
    console.log('💥 Corrupting Bot 1 Token...\n');
    createBackup();

    let env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/TELEGRAM_BOT_TOKEN=([^\n]+)/);

    if (!match) {
        console.log('❌ Bot 1 token not found');
        return;
    }

    const original = match[1];
    const corrupted = 'INVALID_BOT1_' + Date.now();

    env = env.replace(
        /TELEGRAM_BOT_TOKEN=([^\n]+)/,
        `TELEGRAM_BOT_TOKEN=${corrupted}`
    );

    fs.writeFileSync(envPath, env);

    console.log('✅ Bot 1 token corrupted!');
    console.log(`   Original: ${original.substring(0, 20)}...`);
    console.log(`   Corrupted: ${corrupted}`);

    printTestInstructions('Bot 1 is now BROKEN', [
        'Bot 1 will show as Unhealthy (red)',
        'Bot 2 will be the only healthy bot',
        'All uploads will go to Bot 2 only',
        'System continues working (failover success!)'
    ]);
}

function corruptBot2Token() {
    console.log('💥 Corrupting Bot 2 Token...\n');
    createBackup();

    let env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/TELEGRAM_BOT_TOKEN_2=([^\n]+)/);

    if (!match) {
        console.log('❌ Bot 2 token not found');
        return;
    }

    const original = match[1];
    const corrupted = 'INVALID_BOT2_' + Date.now();

    env = env.replace(
        /TELEGRAM_BOT_TOKEN_2=([^\n]+)/,
        `TELEGRAM_BOT_TOKEN_2=${corrupted}`
    );

    fs.writeFileSync(envPath, env);

    console.log('✅ Bot 2 token corrupted!');
    console.log(`   Original: ${original.substring(0, 20)}...`);
    console.log(`   Corrupted: ${corrupted}`);

    printTestInstructions('Bot 2 is now BROKEN', [
        'Bot 2 will show as Unhealthy (red)',
        'Bot 1 will be the only healthy bot',
        'All uploads will go to Bot 1 only',
        'Warning alert will appear in dashboard'
    ]);
}

function corruptBot2Channel() {
    console.log('💥 Corrupting Bot 2 Channel ID...\n');
    createBackup();

    let env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/TELEGRAM_CHANNEL_ID_2=([^\n]+)/);

    if (!match) {
        console.log('❌ Bot 2 channel not found');
        return;
    }

    const original = match[1];
    const corrupted = '-100999999999';

    env = env.replace(
        /TELEGRAM_CHANNEL_ID_2=([^\n]+)/,
        `TELEGRAM_CHANNEL_ID_2=${corrupted}`
    );

    fs.writeFileSync(envPath, env);

    console.log('✅ Bot 2 channel corrupted!');
    console.log(`   Original: ${original}`);
    console.log(`   Corrupted: ${corrupted}`);

    printTestInstructions('Bot 2 has INVALID CHANNEL', [
        'Bot 2 will fail to send messages',
        'After 3 failures, marked as Unhealthy',
        'System automatically fails over to Bot 1',
        'Bot 2 error count will increase'
    ]);
}

function restoreAllBots() {
    console.log('🔄 Restoring all bots...\n');

    if (!fs.existsSync(backupPath)) {
        console.log('❌ No backup found! Bots might already be in working state.');
        return;
    }

    const backup = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(envPath, backup);
    fs.unlinkSync(backupPath);

    console.log('✅ All bots restored to working state!');
    console.log('📝 Backup file deleted');

    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Wait 30 seconds for health checks');
    console.log('   3. Both bots should show as Healthy');
    console.log('   4. Load balancing active again\n');
}

function printTestInstructions(scenario, expectations) {
    console.log('\n' + '='.repeat(60));
    console.log(`📋 Test Scenario: ${scenario}`);
    console.log('='.repeat(60));

    console.log('\n🚀 Steps to Test:');
    console.log('   1. Restart dev server:');
    console.log('      Ctrl+C (stop current)');
    console.log('      npm run dev');
    console.log('');
    console.log('   2. Open admin panel:');
    console.log('      http://localhost:3000/admin/telegram-bots');
    console.log('');
    console.log('   3. Wait ~30 seconds for health check');
    console.log('');
    console.log('   4. Try uploading an image:');
    console.log('      http://localhost:3000/dashboard/upload');

    console.log('\n✅ Expected Results:');
    expectations.forEach((exp, i) => {
        console.log(`   ${i + 1}. ${exp}`);
    });

    console.log('\n🔄 To Restore:');
    console.log('   node test-bot-scenarios.js');
    console.log('   Choose option 4: Restore all bots');

    console.log('\n' + '='.repeat(60) + '\n');
}
