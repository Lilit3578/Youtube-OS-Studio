import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { extractVideoId, fetchComments } from "@/libs/youtube";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/libs/constants/messages";
import logger from "@/libs/logger";
import { checkRateLimit } from "@/libs/rate-limit";

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


export async function POST(req: NextRequest) {
    try {
        // 1. IP-level rate limit — protects YouTube API quota from abuse
        // This runs before session auth to block unauthenticated hammering too.
        const limitResult = await checkRateLimit(req, {
            keyPrefix: "youtube_comments",
            points: 15,
            duration: 60,
        });
        if (limitResult) return limitResult;

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

        // Check quota BEFORE fetching — but do NOT increment yet.
        // We only burn a credit on a successful YouTube API response.
        const currentUser = await User.findOne(
            { email: session.user.email },
            { "usage.commentExplorer.count": 1 }
        );

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found", errorKey: "GENERIC_FAIL" },
                { status: 404 }
            );
        }

        const currentCount = currentUser.usage?.commentExplorer?.count ?? 0;
        if (currentCount >= DAILY_LIMIT) {
            return NextResponse.json(
                {
                    error: ERROR_MESSAGES.TOOLS.COMMENTS.QUOTA_EXCEEDED,
                    errorKey: "QUOTA_EXCEEDED",
                },
                { status: 429 }
            );
        }

        // Fetch comments FIRST — only charge the user on success
        const comments = await fetchComments(videoId);

        // Atomic increment — only after a successful YouTube API response.
        // Uses a conditional update to guard against a race condition where two
        // concurrent requests both pass the check above simultaneously.
        const updatedUser = await User.findOneAndUpdate(
            {
                email: session.user.email,
                "usage.commentExplorer.count": { $lt: DAILY_LIMIT }
            },
            {
                $inc: { "usage.commentExplorer.count": 1 }
            },
            { new: true }
        );

        if (!updatedUser) {
            // Race condition: another concurrent request pushed the count to the limit
            // between our check and this update. Return quota error.
            return NextResponse.json(
                {
                    error: ERROR_MESSAGES.TOOLS.COMMENTS.QUOTA_EXCEEDED,
                    errorKey: "QUOTA_EXCEEDED",
                },
                { status: 429 }
            );
        }

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

    } catch (error: unknown) {
        // Use 'err' key for pino to correctly serialize Error objects
        logger.error({ err: error }, "Error in comment extraction API");

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

/** Map internal error signals to safe, user-facing error keys */
function classifyError(error: unknown): { errorKey: string; status: number } {
    const err = error as { response?: { status?: number }; status?: number; message?: string };
    const status = err?.response?.status || err?.status;
    const message = err?.message || "";

    if (status === 403 || message.includes("YouTube API quota exceeded")) {
        return { errorKey: "QUOTA_EXCEEDED", status: 429 };
    }
    // Invalid or misconfigured API key — server-side config error, not a quota issue
    if (message.includes("YouTube API key invalid") || message.includes("not authorized")) {
        return { errorKey: "GENERIC_FAIL", status: 500 };
    }
    if (message.includes("YOUTUBE_API_KEY environment variable is not configured")) {
        return { errorKey: "GENERIC_FAIL", status: 500 };
    }
    // Comments explicitly disabled on this video
    if (message.includes("Comments are disabled")) {
        return { errorKey: "DISABLED", status: 400 };
    }
    // Video does not exist
    if (message.includes("Video not found") || status === 404) {
        return { errorKey: "NO_PUBLIC", status: 404 };
    }
    return { errorKey: "GENERIC_FAIL", status: 500 };
}
