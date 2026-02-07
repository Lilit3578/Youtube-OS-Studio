import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local manually
try {
    const envPath = join(process.cwd(), ".env.local");
    const envFile = readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
            const [key, ...valueParts] = trimmed.split("=");
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join("=").trim();
            }
        }
    });
} catch (error) {
    console.warn("Warning: Could not load .env.local file");
}

/**
 * Migration script to add missing usage fields to existing users
 * Run with: npx tsx scripts/migrate-user-usage.ts
 */
async function migrateUsers() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("🔄 Connecting to MongoDB...");
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db();
        const users = db.collection("users");

        // Count users without usage fields
        const count = await users.countDocuments({ usage: { $exists: false } });
        console.log(`📊 Found ${count} users without usage fields`);

        if (count === 0) {
            console.log("✅ All users already have usage fields. Nothing to migrate.");
            return;
        }

        // Add usage fields to users who don't have them
        const result = await users.updateMany(
            { usage: { $exists: false } },
            {
                $set: {
                    usage: {
                        metadataInspector: { count: 0, lastResetDate: new Date() },
                        commentExplorer: { count: 0, lastResetDate: new Date() },
                        toolRequests: { count: 0, lastResetDate: new Date() },
                    },
                },
            }
        );

        console.log(`✅ Migration complete! Updated ${result.modifiedCount} users`);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        await client.close();
        console.log("🔌 Disconnected from MongoDB");
    }
}

migrateUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
