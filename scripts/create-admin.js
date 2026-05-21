// Script to create/list admin users directly in MongoDB.
// Defaults:
//   Email: admin@example.com
//   Password: admin123
//
// Usage:
//   node scripts/create-admin.js create-admin
//   node scripts/create-admin.js list-users
//
// Optional env vars:
//   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI or MONGODB_URI

const fs = require('fs');
const path = require('path');
const bcrypt = require('../backend/node_modules/bcryptjs');
const mongoose = require('../backend/node_modules/mongoose');

loadEnvFile(path.resolve(__dirname, '../backend/.env'));
loadEnvFile(path.resolve(__dirname, '../.env'));

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/water-pollution-gis';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function maskUri(uri) {
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log('✅ Connected to MongoDB');
  console.log('🔗 Connection:', maskUri(MONGODB_URI));
}

async function createAdmin() {
  try {
    await connect();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      const updates = {};

      if (existingAdmin.role !== 'admin') {
        updates.role = 'admin';
      }

      if (existingAdmin.username !== ADMIN_USERNAME) {
        updates.username = ADMIN_USERNAME;
      }

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: existingAdmin._id }, updates);
        console.log('✅ Existing user updated to admin');
      } else {
        console.log('ℹ️ Admin user already exists');
      }

      console.log('📧 Email:', ADMIN_EMAIL);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🔐 Role: admin');
      console.log('🆔 User ID:', existingAdmin._id.toString());
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('👤 Username:', ADMIN_USERNAME);
    console.log('🔐 Password:', ADMIN_PASSWORD);
    console.log('🆔 User ID:', adminUser._id.toString());
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

async function listUsers() {
  try {
    await connect();

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    console.log('\n📋 All Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (users.length === 0) {
      console.log('No users found.');
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Error listing users:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

const command = process.argv[2];

if (command === 'create-admin') {
  createAdmin();
} else if (command === 'list-users') {
  listUsers();
} else {
  console.log('📖 Usage:');
  console.log('  node scripts/create-admin.js create-admin  - Create admin user');
  console.log('  node scripts/create-admin.js list-users    - List all users');
  console.log('');
  console.log('🔐 Default Admin Credentials:');
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}
