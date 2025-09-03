import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface GlobalWithMongoose {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const globalWithMongoose = global as typeof global & GlobalWithMongoose;

let cached = globalWithMongoose.mongooseConn;
if (!cached) {
  cached = globalWithMongoose.mongooseConn = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }
  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: undefined,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}


