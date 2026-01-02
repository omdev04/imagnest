/**
 * Test View Tracking
 * 
 * This script checks if views are being tracked in the database
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const imageSchema = new mongoose.Schema({
    originalName: String,
    views: Number,
    accessCount: Number,
    userId: mongoose.Schema.Types.ObjectId,
    createdAt: Date,
});

const Image = mongoose.model('Image', imageSchema);

async function checkViews() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const images = await Image.find({}).select('originalName views accessCount createdAt').sort({ createdAt: -1 }).limit(10);

        console.log('📊 Latest 10 Images:\n');
        console.log('─'.repeat(80));

        let totalViews = 0;
        images.forEach((img, i) => {
            const views = img.views || 0;
            totalViews += views;
            console.log(`${i + 1}. ${img.originalName || 'Unnamed'}`);
            console.log(`   Views: ${views} | Access Count: ${img.accessCount || 0}`);
            console.log(`   Created: ${img.createdAt?.toLocaleString() || 'Unknown'}\n`);
        });

        console.log('─'.repeat(80));
        console.log(`Total Views (last 10 images): ${totalViews}\n`);

        // Get total across all images
        const allImages = await Image.find({});
        const grandTotal = allImages.reduce((sum, img) => sum + (img.views || 0), 0);
        console.log(`📈 Grand Total Views (all ${allImages.length} images): ${grandTotal}\n`);

        if (grandTotal === 0) {
            console.log('⚠️  No views tracked yet. To test:');
            console.log('   1. Go to /dashboard/images');
            console.log('   2. Click on an image to view it');
            console.log('   3. The view should be counted');
            console.log('   4. Run this script again to verify\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkViews();
