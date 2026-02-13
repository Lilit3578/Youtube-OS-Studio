import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import clientPromise from "@/libs/mongo";

export async function DELETE() {
    try {
        const session = await auth();

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
            await db.collection("accounts").deleteMany({ userId: session.user.id });
            await db.collection("sessions").deleteMany({ userId: session.user.id });
            // Also remove the user doc from the raw users collection (adapter may use a different doc)
            await db.collection("users").deleteOne({ email });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[ACCOUNT_DELETE_ERROR]", {
            message: error.message,
            stack: error.stack,
            user: (await auth())?.user?.email
        });
        return NextResponse.json(
            { error: "Failed to delete account. Please try again later." },
            { status: 500 }
        );
    }
}
