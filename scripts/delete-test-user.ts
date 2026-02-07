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
 * Script to delete a specific user for testing
 * Run with: npx tsx scripts/delete-test-user.ts
 */
async function deleteTestUser() {
    const uri = process.env.MONGODB_URI;
    const testEmail = "lilit.poetry@gmail.com"; // Change this to your test email

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
        const accounts = db.collection("accounts");

        // Delete user
        const userResult = await users.deleteOne({ email: testEmail });
        console.log(`🗑️  Deleted ${userResult.deletedCount} user(s) with email: ${testEmail}`);

        // Delete associated accounts
        const accountsResult = await accounts.deleteMany({
            userId: { $exists: true } // This will need to be adjusted based on your schema
        });
        console.log(`🗑️  Deleted ${accountsResult.deletedCount} associated account(s)`);

        console.log("✅ Cleanup complete!");
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        throw error;
    } finally {
        await client.close();
        console.log("🔌 Disconnected from MongoDB");
    }
}

deleteTestUser()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
