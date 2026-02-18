import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import type { Session } from "next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import clientPromise from "@/libs/mongo";
import { ObjectId } from "mongodb";
import logger from "@/libs/logger";

export async function DELETE() {
    // Declared outside try so the catch block can log the user email
    let session: Session | null = null;
    try {
        session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        // Delete from Mongoose-managed User collection
        await connectMongo();
        await User.deleteOne({ email });

        // Delete from NextAuth adapter collections (accounts, sessions)
        const client = await clientPromise;
        if (client) {
            const db = client.db();
            // Fix: Cast string ID to ObjectId for native driver queries
            const objectId = new ObjectId(session.user.id);

            await db.collection("accounts").deleteMany({ userId: objectId });
            await db.collection("sessions").deleteMany({ userId: objectId });
            // Also remove the user doc from the raw users collection (adapter may use a different doc)
            await db.collection("users").deleteOne({ _id: objectId });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        logger.error({
            err: error,
            user: session?.user?.email
        }, "[ACCOUNT_DELETE_ERROR]");
        return NextResponse.json(
            { error: "Failed to delete account. Please try again later." },
            { status: 500 }
        );
    }
}
