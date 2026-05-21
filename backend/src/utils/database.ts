import mongoose from 'mongoose';

// MongoDB connection string - use environment variable or local default
// Supports both MONGO_URI and MONGODB_URI environment variable names.
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/water-pollution-gis';

export async function connectDatabase() {
  try {
    // Connection options compatible with MongoDB Atlas
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log(`📍 Database: water-pollution-gis`);
    
    // Test connection with a simple ping
    mongoose.connection.once('open', () => {
      console.log('🔄 MongoDB connection established');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB error:', error);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔗 Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}
