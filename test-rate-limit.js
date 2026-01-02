/**
 * API Test Script - Aggressive Rate Limit Testing
 * Simulates reaching the rate limit
 */

const API_KEY = 'fg_live_d590772e5cfd11eb8a061ebe4d9ff43d015b5f2f9b633ace4ed5e70949f9ac76';
const BASE_URL = 'http://localhost:3000/api';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRateLimitBreach() {
    log('🚦 Testing Rate Limit - Aggressive Test', 'cyan');
    log('Simulating rapid API calls to trigger 429 Too Many Requests\n', 'yellow');

    let successCount = 0;
    let rateLimitedCount = 0;
    let errorCount = 0;

    // Make 50 requests to potentially hit the limit
    for (let i = 1; i <= 50; i++) {
        try {
            const response = await fetch(`${BASE_URL}/images`, {
                headers: { 'x-api-key': API_KEY }
            });

            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');

            if (response.status === 200) {
                successCount++;
                process.stdout.write(`\r✅ Request ${i}/50 | Success: ${successCount} | Limited: ${rateLimitedCount} | Remaining: ${remaining}/${limit}     `);
            } else if (response.status === 429) {
                rateLimitedCount++;
                const data = await response.json();
                log(`\n❌ Request ${i}: RATE LIMITED! ${data.message}`, 'red');
                log(`   ⏰ Reset in ${data.resetIn} seconds`, 'yellow');
                log(`   Current count - Success: ${successCount}, Limited: ${rateLimitedCount}\n`, 'cyan');
                break; // Stop after hitting rate limit
            } else {
                errorCount++;
                log(`\n⚠️  Request ${i}: ${response.status}`, 'yellow');
            }

            // Small delay to see progress
            await new Promise(resolve => setTimeout(resolve, 10));

        } catch (error) {
            errorCount++;
            log(`\n❌ Request ${i} failed: ${error.message}`, 'red');
        }
    }

    log('\n\n' + '='.repeat(60), 'cyan');
    log('📊 Test Results:', 'cyan');
    log(`   ✅ Successful requests: ${successCount}`, 'green');
    log(`   ❌ Rate limited requests: ${rateLimitedCount}`, 'yellow');
    log(`   ⚠️  Other errors: ${errorCount}`, 'red');
    log('='.repeat(60), 'cyan');

    if (rateLimitedCount > 0) {
        log('\n✅ Rate limiting is working correctly!', 'green');
        log('   The API properly enforces plan-based rate limits.', 'green');
    } else {
        log('\n⚠️  Rate limit not reached in this test.', 'yellow');
        log(`   Plan allows 100 requests/hour. Made ${successCount} requests.`, 'yellow');
    }
}

testRateLimitBreach().catch(console.error);
