import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { extractVideoId, fetchComments } from "@/libs/youtube";
import { z } from "zod";

// Set max duration for API route to 60 seconds
export const maxDuration = 60;

// Input validation schema
const requestSchema = z.object({
    url: z
        .string()
        .min(1, "URL is required")
        .max(500, "URL is too long")
        .trim()
        .refine(
            (url) => {
                // Basic YouTube URL validation
                return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
            },
            { message: "Invalid YouTube URL format" }
        ),
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON in request body", errorKey: "INVALID_REQUEST" },
                { status: 400 }
            );
        }

        // Validate input with Zod
        const validation = requestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: validation.error.issues[0].message,
                    errorKey: "INVALID_URL",
                },
                { status: 400 }
            );
        }

        const { url } = validation.data;

        // Extract video ID
        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json(
                { error: "Could not extract video ID from URL", errorKey: "INVALID_URL" },
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

        // Check if it's a different day (UTC-based for consistency)
        const isSameDay =
            now.getUTCFullYear() === lastReset.getUTCFullYear() &&
            now.getUTCMonth() === lastReset.getUTCMonth() &&
            now.getUTCDate() === lastReset.getUTCDate();

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
                { error: "Daily limit of 20 requests reached.", errorKey: "QUOTA_EXCEEDED" },
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

        let errorKey = "GENERIC_FAIL";
        if (error.response?.status === 403 || error.status === 403) errorKey = "QUOTA_EXCEEDED";
        if (error.message?.includes("disabled")) errorKey = "DISABLED";
        if (error.message?.includes("no public")) errorKey = "NO_PUBLIC";

        return NextResponse.json(
            { error: error.message || "Internal Server Error", errorKey },
            { status: 500 }
        );
    }
}
