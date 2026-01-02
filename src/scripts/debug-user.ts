
import 'dotenv/config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function debugUser() {
    try {
        await dbConnect();

        console.log('--- User Role Manager ---');

        const email = await question('Enter user email: ');
        if (!email.trim()) {
            console.log('Email is required.');
            process.exit(1);
        }

        const roleInput = await question('Choose role (1: Admin, 2: Superadmin) [default: 2]: ');
        let role = 'superadmin';

        const selection = roleInput.trim();
        if (selection === '1') {
            role = 'admin';
        } else if (selection === '2' || selection === '') {
            role = 'superadmin';
        } else {
            console.log('❌ Invalid selection! Please enter 1 or 2.');
            process.exit(1);
        }

        const users = await User.find({ email: email.trim() });

        if (users.length === 0) {
            console.error(`❌ Error: User with email '${email}' not found.`);
            process.exit(1);
        }

        console.log(`\nFound ${users.length} users with email ${email}:`);

        users.forEach(u => {
            console.log({
                id: u._id,
                username: u.username,
                email: u.email,
                currentRole: u.role,
                googleId: u.googleId,
                status: u.status
            });
        });

        const confirm = await question(`\nAre you sure you want to promote these users to '${role}'? (y/n): `);
        if (confirm.toLowerCase() !== 'y') {
            console.log('Operation cancelled.');
            process.exit(0);
        }

        console.log(`Updating users to ${role}...`);
        await User.updateMany({ email: email.trim() }, { $set: { role: role } });
        console.log('✅ Success! Roles updated.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
}

debugUser();
