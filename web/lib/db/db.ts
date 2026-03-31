import mongoose from "mongoose";

declare global {
  var mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseConnection || { conn: null, promise: null };
global.mongooseConnection = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn.connection;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGODB_URI (or MONGO_URI) environment variable is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn.connection;
}
