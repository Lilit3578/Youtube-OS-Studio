import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { extractVideoId, fetchComments } from "@/libs/youtube";

// Set max duration for API route to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const videoId = extractVideoId(url);

        if (!videoId) {
            return NextResponse.json(
                { error: "Invalid YouTube URL" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Check usage limits
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Reset daily limit if it's a new day
        const now = new Date();
        // Ensure usage object and lastResetDate exist (handle potential missing fields in old docs)
        const explorerUsage = user.usage?.commentExplorer || { count: 0, lastResetDate: new Date() };
        const lastReset = new Date(explorerUsage.lastResetDate);

        // Check if it's a different day
        const isSameDay =
            now.getFullYear() === lastReset.getFullYear() &&
            now.getMonth() === lastReset.getMonth() &&
            now.getDate() === lastReset.getDate();

        if (!isSameDay) {
            // Safe access to nested properties
            if (!user.usage) user.usage = {};
            if (!user.usage.commentExplorer) user.usage.commentExplorer = { count: 0, lastResetDate: now };

            user.usage.commentExplorer.count = 0;
            user.usage.commentExplorer.lastResetDate = now;
            await user.save();
        }

        if (user.usage.commentExplorer.count >= 20) {
            return NextResponse.json(
                { error: "Daily limit of 20 requests reached." },
                { status: 429 }
            );
        }

        // Fetch comments
        const comments = await fetchComments(videoId);

        // Calculate counts
        const counts = {
            total: comments.length,
            questions: comments.filter(c => c.intent === "question").length,
            requests: comments.filter(c => c.intent === "request").length,
            feedback: comments.filter(c => c.intent === "feedback").length,
            other: comments.filter(c => c.intent === "other").length,
        };

        // Increment usage
        user.usage.commentExplorer.count += 1;
        await user.save();

        return NextResponse.json({
            videoId,
            comments,
            counts
        });

    } catch (error: any) {
        console.error("Error in comment extraction API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
