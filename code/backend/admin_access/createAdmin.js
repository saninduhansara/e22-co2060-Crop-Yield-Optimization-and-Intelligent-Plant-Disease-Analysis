// This script connects to MongoDB and creates a new admin user.
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';

// --- Configuration ---
// This should match the MONGO_URI in your backend's .env file
const MONGO_URI = 'mongodb://localhost:27017/cropYieldDB';

// --- Mongoose User Schema (inferred from your project) ---
// This should closely match your `models/user.js` schema.
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    nic: { type: String, unique: true, required: true },
    address: { type: String },
    division: { type: String },
    district: { type: String },
    role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
    isBlocked: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// --- Main Function ---
async function createAdmin() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Helper to ask questions in terminal
    const ask = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');

        const email = await ask('Enter admin email: ');
        const password = await ask('Enter admin password: ');
        const firstName = await ask('Enter first name: ');
        const lastName = await ask('Enter last name: ');
        const nic = await ask('Enter NIC: ');

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
        if (existingUser) {
            console.error('\n❌ Error: A user with this email or NIC already exists.');
            rl.close();
            return;
        }

        console.log('\nCreating admin user...');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            nic,
            role: 'admin',
            // Add other fields with default/dummy values if needed
            phone: '0000000000',
            address: 'N/A',
            division: 'N/A',
            district: 'N/A',
        });

        await adminUser.save();

        console.log('\n✅ Admin user created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);

        rl.close();

    } catch (error) {
        console.error('\n❌ Failed to create admin user:', error.message);
        if (rl) rl.close();
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

createAdmin();