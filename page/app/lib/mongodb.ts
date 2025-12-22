import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definida en .env");
}

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: Cached | undefined;
}

const cached: Cached = global._mongoCache || { conn: null, promise: null };

if (!cached.promise) {
  const opts = { bufferCommands: false };
  cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  global._mongoCache = cached;
}

export default async function connectMongo() {
  if (cached.conn) return cached.conn;
  cached.conn = await cached.promise;
  return cached.conn;
}
