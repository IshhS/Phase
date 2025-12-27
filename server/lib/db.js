import 'dotenv/config';
import mongoose from "mongoose";

const MONGODB_URI_FALLBACK = "mongodb://localhost:27017/Phase";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const CONNECTION_STRING = process.env.MONGO_URI || MONGODB_URI_FALLBACK;
    if (cached.conn) {
        // If a connection is already established, return the native Db object
        return { conn: cached.conn, db: cached.conn.connection.db };
    }

    if (cached.promise) {
        // If a connection is in progress, wait for it and then return the native Db object
        cached.conn = await cached.promise;
        return { conn: cached.conn, db: cached.conn.connection.db };
    }

    if (!CONNECTION_STRING) { // Check the module-level constant
        throw new Error(
            "Please define the MONGODB_URI environment variable inside .env.local or provide a default."
        );
    }

    try {
        // Use the module-level CONNECTION_STRING here
        cached.promise = mongoose.connect(CONNECTION_STRING, {
            bufferCommands: false,
            bufferTimeoutMS: 30000,
        });

        cached.conn = await cached.promise;
        console.log("MongoDB Connected.");
        // Return both the Mongoose connection and the native Db object
        return { conn: cached.conn, db: cached.conn.connection.db };
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default dbConnect;
