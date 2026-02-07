import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { extractVideoId, fetchComments } from "@/libs/youtube";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/libs/constants/messages";

// Set max duration for API route to 60 seconds
export const maxDuration = 60;

const DAILY_LIMIT = 20;

// Input validation schema
const requestSchema = z.object({
    url: z
        .string()
        .min(1, "URL is required")
        .max(500, "URL is too long")
        .trim()
        .refine(
            (url) => {
                return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
            },
            { message: "Invalid YouTube URL format" }
        ),
});

/** Map internal error signals to safe, user-facing error keys */
function classifyError(error: any): { errorKey: string; status: number } {
    if (error.response?.status === 403 || error.status === 403) {
        return { errorKey: "QUOTA_EXCEEDED", status: 429 };
    }
    if (error.message?.includes("disabled")) {
        return { errorKey: "DISABLED", status: 400 };
    }
    if (error.message?.includes("not found") || error.response?.status === 404) {
        return { errorKey: "NO_PUBLIC", status: 404 };
    }
    return { errorKey: "GENERIC_FAIL", status: 500 };
}

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

        // Atomic usage check and increment — prevents TOCTOU race condition.
        // Resets counter if the last reset was before today (UTC).
        const now = new Date();
        const startOfDay = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );

        // First, reset any stale counters atomically
        await User.updateOne(
            {
                email: session.user.email,
                "usage.commentExplorer.lastResetDate": { $lt: startOfDay },
            },
            {
                $set: {
                    "usage.commentExplorer.count": 0,
                    "usage.commentExplorer.lastResetDate": now,
                },
            }
        );

        // Get user and check limit (avoiding nested field query issues)
        console.log("[DEBUG] Finding user:", session.user.email);

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            console.log("[DEBUG] User not found");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("[DEBUG] User found, checking usage");
        console.log("[DEBUG] Current count:", user.usage?.commentExplorer?.count);
        console.log("[DEBUG] Limit:", DAILY_LIMIT);

        // Check if usage fields exist, if not initialize them
        if (!user.usage || !user.usage.commentExplorer) {
            console.log("[DEBUG] Usage fields missing, initializing");
            user.usage = {
                metadataInspector: { count: 0, lastResetDate: new Date() },
                commentExplorer: { count: 0, lastResetDate: new Date() },
                toolRequests: { count: 0, lastResetDate: new Date() },
            };
            await user.save();
        }

        // Check if under limit
        if (user.usage.commentExplorer.count >= DAILY_LIMIT) {
            console.log("[DEBUG] Limit reached");
            return NextResponse.json(
                {
                    error: ERROR_MESSAGES.TOOLS.COMMENTS.QUOTA_EXCEEDED,
                    errorKey: "QUOTA_EXCEEDED",
                },
                { status: 429 }
            );
        }

        // Increment counter
        console.log("[DEBUG] Incrementing counter");
        user.usage.commentExplorer.count += 1;
        await user.save();
        console.log("[DEBUG] Counter incremented to:", user.usage.commentExplorer.count);

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

        return NextResponse.json({
            videoId,
            comments,
            counts
        });

    } catch (error: any) {
        console.error("Error in comment extraction API:", error);

        // Never leak internal error messages to the client
        const { errorKey, status } = classifyError(error);
        const safeMessage =
            (ERROR_MESSAGES.TOOLS.COMMENTS as Record<string, string>)[errorKey] ||
            ERROR_MESSAGES.TOOLS.COMMENTS.GENERIC_FAIL;

        return NextResponse.json(
            { error: safeMessage, errorKey },
            { status }
        );
    }
}
