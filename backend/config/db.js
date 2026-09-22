const mongoose = require('mongoose');
const path = require('path');

let memoryServer = null;

const connectDB = async () => {
  const isInMemory = process.env.USE_IN_MEMORY_DB === 'true';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mining_platform';

  if (!isInMemory) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`MongoDB connection failed: ${err.message}. Falling back to in-memory DB.`);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const cacheDir = process.env.MONGOMS_DOWNLOAD_DIR || path.join(__dirname, '..', '.cache');

  memoryServer = await MongoMemoryServer.create({
    binary: {
      downloadDir: cacheDir
    },
    instance: {
      dbName: 'mining_platform'
    }
  });

  const uri = memoryServer.getUri();
  const conn = await mongoose.connect(uri);
  return conn;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
