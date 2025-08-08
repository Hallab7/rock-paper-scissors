// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Please define the MONGODB_URI environment variable");

let cached = globalThis._mongo; // connection cache for serverless environments
if (!cached) cached = globalThis._mongo = { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db(process.env.MONGODB_DB || undefined),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const clientPromise = connectToDatabase();
export default clientPromise;
