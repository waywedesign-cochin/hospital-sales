import mongoose from "mongoose";
import "@/app/models";

const MONGODB_URL =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URL
    : process.env.MONGODB_URL_TEST;

if (!MONGODB_URL) throw new Error("MongoDB URL not set");

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

global.mongoose = global.mongoose || { conn: null, promise: null };

export async function dbConnect(): Promise<mongoose.Connection> {
  if (global.mongoose.conn) return global.mongoose.conn;

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose
      .connect(MONGODB_URL!)
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}
