// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGODB_URI_PROD 
            : process.env.MONGODB_URI;

        const conn = await mongoose.connect(mongoURI, {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server found
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            bufferCommands: false // Disable mongoose buffering
        });

        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📦 MongoDB disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('📦 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};
    
module.exports = connectDB;
