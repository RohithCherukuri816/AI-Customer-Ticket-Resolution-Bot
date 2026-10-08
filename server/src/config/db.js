const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ticket_resolution';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if local mongo is not running
    });
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to primary MongoDB (${error.message}).`);
    console.log('[Database] Initializing embedded in-memory MongoDB fallback for seamless zero-setup demo...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB initialized and connected successfully! (${memUri})`);
    } catch (memError) {
      console.error('[Database] Failed to launch embedded MongoMemoryServer:', memError.message);
      console.error('[Database] Please provide a valid MONGODB_URI in .env (such as MongoDB Atlas free cluster).');
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
