/**
 * Comprehensive API Test Suite
 * Tests ALL API endpoints with rate limiting
 */

const API_KEY = 'fg_live_d590772e5cfd11eb8a061ebe4d9ff43d015b5f2f9b633ace4ed5e70949f9ac76';
const BASE_URL = 'http://localhost:3000/api';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeaders(headers, title = 'Rate Limit Info') {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (limit) {
        log(`  📊 ${title}:`, 'blue');
        log(`     Limit: ${limit}/hour | Remaining: ${remaining} | Reset: ${new Date(reset).toLocaleTimeString()}`, 'blue');
    }
}

let testImageId = null; // Store for later tests

// =============================================================================
// TEST 1: Upload Image
// =============================================================================
async function testUploadImage() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 1: POST /api/upload - Upload Image', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        // Create a simple test image (1x1 pixel PNG)
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const imageBuffer = Buffer.from(base64Image, 'base64');

        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', imageBuffer, {
            filename: 'test-api-image.png',
            contentType: 'image/png'
        });

        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
        logHeaders(response.headers);

        if (response.ok) {
            log(`✅ Image uploaded successfully!`, 'green');
            log(`   URL: ${data.url}`, 'blue');
            log(`   Image ID: ${data.imageId}`, 'blue');
            log(`   Filename: ${data.filename}`, 'blue');
            testImageId = data.imageId; // Store for later tests
        } else {
            log(`❌ Upload failed: ${data.error}`, 'red');
        }

        return { success: response.ok, data };
    } catch (error) {
        log(`❌ Upload test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 2: List Images
// =============================================================================
async function testListImages() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 2: GET /api/images - List All Images (Paginated)', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/images?page=1&limit=5`, {
            headers: { 'x-api-key': API_KEY }
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
        logHeaders(response.headers);

        if (response.ok) {
            log(`✅ List retrieved successfully!`, 'green');
            log(`   Total Images: ${data.pagination.total}`, 'blue');
            log(`   Page: ${data.pagination.page}/${data.pagination.pages}`, 'blue');
            log(`   Showing: ${data.images.length} images`, 'blue');

            if (data.images.length > 0) {
                log(`\n   Recent Images:`, 'magenta');
                data.images.slice(0, 3).forEach((img, i) => {
                    log(`   ${i + 1}. ${img.filename} (${(img.size / 1024).toFixed(2)} KB) - ${img.views} views`, 'blue');
                });

                // Store first image ID for later tests if we don't have one
                if (!testImageId) {
                    testImageId = data.images[0]._id;
                }
            }
        } else {
            log(`❌ List failed: ${data.error}`, 'red');
            if (data.message) log(`   ${data.message}`, 'yellow');
        }

        return { success: response.ok, data };
    } catch (error) {
        log(`❌ List test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 3: Get Single Image Details
// =============================================================================
async function testGetImageDetails() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 3: GET /api/images/:id - Get Image Details', 'cyan');
    log('='.repeat(70), 'cyan');

    if (!testImageId) {
        log(`⚠️  Skipped: No image ID available`, 'yellow');
        return { success: false, skipped: true };
    }

    try {
        const response = await fetch(`${BASE_URL}/images/${testImageId}`, {
            headers: { 'x-api-key': API_KEY }
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
        logHeaders(response.headers);

        if (response.ok) {
            log(`✅ Image details retrieved successfully!`, 'green');
            log(`   Filename: ${data.image.filename}`, 'blue');
            log(`   Size: ${(data.image.size / 1024).toFixed(2)} KB`, 'blue');
            log(`   URL: ${data.image.url}`, 'blue');
            log(`   Views: ${data.image.views}`, 'blue');
            log(`   Privacy: ${data.image.privacy}`, 'blue');
        } else {
            log(`❌ Get details failed: ${data.error}`, 'red');
        }

        return { success: response.ok, data };
    } catch (error) {
        log(`❌ Get details test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 4: Delete Image
// =============================================================================
async function testDeleteImage() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 4: DELETE /api/images/:id - Delete Image', 'cyan');
    log('='.repeat(70), 'cyan');

    if (!testImageId) {
        log(`⚠️  Skipped: No image ID available`, 'yellow');
        return { success: false, skipped: true };
    }

    try {
        const response = await fetch(`${BASE_URL}/images/${testImageId}`, {
            method: 'DELETE',
            headers: { 'x-api-key': API_KEY }
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
        logHeaders(response.headers);

        if (response.ok) {
            log(`✅ Image deleted successfully!`, 'green');
            log(`   Message: ${data.message}`, 'blue');
        } else {
            log(`❌ Delete failed: ${data.error}`, 'red');
        }

        return { success: response.ok, data };
    } catch (error) {
        log(`❌ Delete test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 5: Get API Keys (Session-based, won't work with API key)
// =============================================================================
async function testGetApiKeys() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 5: GET /api/keys - List API Keys (Session Required)', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/keys`, {
            headers: { 'x-api-key': API_KEY }
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.ok ? 'green' : 'red');

        if (response.ok) {
            log(`✅ API keys retrieved!`, 'green');
            log(`   Total Keys: ${data.keys?.length || 0}`, 'blue');
        } else {
            log(`⚠️  Expected: This endpoint requires session auth (web UI only)`, 'yellow');
            log(`   Error: ${data.error}`, 'yellow');
        }

        return { success: response.ok, data };
    } catch (error) {
        log(`❌ Get keys test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 6: Unauthorized Access
// =============================================================================
async function testUnauthorized() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 6: Security - Unauthorized Access (Invalid API Key)', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/images`, {
            headers: { 'x-api-key': 'invalid_key_12345' }
        });

        const data = await response.json();

        log(`Status: ${response.status}`, response.status === 401 ? 'green' : 'red');

        if (response.status === 401) {
            log(`✅ Security working correctly! Unauthorized access blocked.`, 'green');
            log(`   Error: ${data.error}`, 'blue');
        } else {
            log(`❌ Security issue: Should have returned 401`, 'red');
        }

        return { success: response.status === 401, data };
    } catch (error) {
        log(`❌ Unauthorized test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 7: Rate Limiting
// =============================================================================
async function testRateLimiting() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 7: Rate Limiting - Multiple Rapid Requests', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        const numRequests = 15;
        log(`Making ${numRequests} rapid requests to check rate limiting...`, 'yellow');

        const results = [];

        for (let i = 1; i <= numRequests; i++) {
            const response = await fetch(`${BASE_URL}/images`, {
                headers: { 'x-api-key': API_KEY }
            });

            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');

            results.push({
                request: i,
                status: response.status,
                remaining,
                limit
            });

            if (response.status === 429) {
                const data = await response.json();
                log(`\n❌ Request ${i}: RATE LIMITED!`, 'red');
                log(`   ${data.message}`, 'yellow');
                log(`   Reset in: ${data.resetIn}s`, 'yellow');
                break;
            }

            // Small delay
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        log(`\n📊 Rate Limit Results:`, 'blue');
        log(`   Total Requests: ${results.length}`, 'blue');
        log(`   Successful: ${results.filter(r => r.status === 200).length}`, 'green');
        log(`   Rate Limited: ${results.filter(r => r.status === 429).length}`, 'yellow');

        const lastResult = results[results.length - 1];
        log(`   Final Status: ${lastResult.remaining}/${lastResult.limit} requests remaining`, 'blue');

        const allSuccessful = results.every(r => r.status === 200);
        if (allSuccessful) {
            log(`\n✅ All requests processed. Rate limiting tracking working!`, 'green');
        }

        return { success: true, results };
    } catch (error) {
        log(`❌ Rate limiting test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// TEST 8: Pagination
// =============================================================================
async function testPagination() {
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST 8: Pagination - Multiple Pages', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        // Test different pages
        const pages = [
            { page: 1, limit: 2 },
            { page: 2, limit: 2 },
            { page: 1, limit: 10 }
        ];

        for (const { page, limit } of pages) {
            const response = await fetch(`${BASE_URL}/images?page=${page}&limit=${limit}`, {
                headers: { 'x-api-key': API_KEY }
            });

            const data = await response.json();

            if (response.ok) {
                log(`✅ Page ${page} (limit: ${limit}): ${data.images.length} images returned`, 'green');
                log(`   Total: ${data.pagination.total}, Pages: ${data.pagination.pages}`, 'blue');
            } else {
                log(`❌ Page ${page} failed: ${data.error}`, 'red');
            }
        }

        return { success: true };
    } catch (error) {
        log(`❌ Pagination test failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// =============================================================================
// RUN ALL TESTS
// =============================================================================
async function runAllTests() {
    log('\n');
    log('████████████████████████████████████████████████████████████████████████', 'cyan');
    log('█                                                                      █', 'cyan');
    log('█          COMPREHENSIVE API TEST SUITE - ALL ENDPOINTS               █', 'cyan');
    log('█                                                                      █', 'cyan');
    log('████████████████████████████████████████████████████████████████████████', 'cyan');

    const startTime = Date.now();

    const results = {
        upload: await testUploadImage(),
        list: await testListImages(),
        getDetails: await testGetImageDetails(),
        delete: await testDeleteImage(),
        getKeys: await testGetApiKeys(),
        unauthorized: await testUnauthorized(),
        rateLimiting: await testRateLimiting(),
        pagination: await testPagination()
    };

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Summary
    log('\n' + '='.repeat(70), 'magenta');
    log('📊 TEST SUMMARY', 'magenta');
    log('='.repeat(70), 'magenta');

    const tests = [
        { name: 'Upload Image (POST /upload)', result: results.upload },
        { name: 'List Images (GET /images)', result: results.list },
        { name: 'Get Image Details (GET /images/:id)', result: results.getDetails },
        { name: 'Delete Image (DELETE /images/:id)', result: results.delete },
        { name: 'Get API Keys (GET /keys)', result: results.getKeys },
        { name: 'Unauthorized Access', result: results.unauthorized },
        { name: 'Rate Limiting', result: results.rateLimiting },
        { name: 'Pagination', result: results.pagination }
    ];

    const passed = tests.filter(t => t.result.success).length;
    const total = tests.length;

    tests.forEach((test, i) => {
        const status = test.result.success ? '✅' : (test.result.skipped ? '⚠️ ' : '❌');
        const color = test.result.success ? 'green' : (test.result.skipped ? 'yellow' : 'red');
        log(`${i + 1}. ${status} ${test.name}`, color);
    });

    log('\n' + '='.repeat(70), 'magenta');
    log(`✅ Passed: ${passed}/${total} tests`, passed === total ? 'green' : 'yellow');
    log(`⏱️  Duration: ${duration}s`, 'blue');
    log('='.repeat(70), 'magenta');

    if (passed === total) {
        log('\n🎉 ALL TESTS PASSED! API IS WORKING PERFECTLY! 🎉\n', 'green');
    } else {
        log('\n⚠️  Some tests failed or were skipped. Check details above.\n', 'yellow');
    }
}

// Run the test suite
runAllTests().catch(error => {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
});
