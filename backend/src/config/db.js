import mongoose from 'mongoose';

let hasConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not set. The API will run, but any database ' +
        'operation will fail until it is configured in backend/.env'
    );
    return;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    hasConnected = true;
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    process.exitCode = 1;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
}

export function isDbConnected() {
  return hasConnected && mongoose.connection.readyState === 1;
}
