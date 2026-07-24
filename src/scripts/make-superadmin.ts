import process from 'process';
import 'dotenv/config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

async function makeSuperAdmin() {
    const email = 'oms976346@gmail.com';

    try {
        console.log('Connecting to MongoDB...');
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            console.log('Make sure this user has logged in at least once via Google.');
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user.email}) — current role: ${user.role}`);

        await User.updateOne({ email }, { $set: { role: 'superadmin' } });

        console.log(`✅ Done! ${email} is now a superadmin.`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

makeSuperAdmin();
