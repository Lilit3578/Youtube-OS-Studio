import { MongoClient } from "mongodb";
import connectMongo from "./mongoose";

// CRIT-01 FIX: Unified Database Connection Pool
// This file now reuses the robust Mongoose connection established in libs/mongoose.ts
// instead of creating a separate, competing connection pool.

const clientPromise: Promise<MongoClient> = connectMongo().then((mongoose) => {
  return mongoose.connection.getClient() as unknown as MongoClient;
});

export default clientPromise;
