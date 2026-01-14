// libs/rate-limit.ts
// Server-side rate limiting helper for YouTube API tools (20 requests/day per tool)

import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

const DAILY_LIMIT = 20;

type ToolType = "metadataInspector" | "commentExplorer";

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Check if user is within rate limit and increment usage if allowed.
 * Resets at midnight in user's local timezone (from X-Timezone header).
 */
export async function checkRateLimit(
    toolType: ToolType,
    timezone?: string
): Promise<RateLimitResult> {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        throw new Error("User not found");
    }

    // Get usage for this tool
    const usage = user.usage?.[toolType] || { count: 0, lastResetDate: new Date() };
    const lastReset = new Date(usage.lastResetDate);

    // Calculate midnight in user's timezone (or UTC if not provided)
    const now = new Date();
    const userTz = timezone || "UTC";

    // Get today's date at midnight in user's timezone
    const todayMidnight = new Date(
        now.toLocaleDateString("en-US", { timeZone: userTz })
    );

    // Check if last reset was before today's midnight
    const needsReset = lastReset < todayMidnight;

    let currentCount = usage.count;

    if (needsReset) {
        // Reset counter for new day
        currentCount = 0;
    }

    // Check if within limit
    if (currentCount >= DAILY_LIMIT) {
        // Calculate next midnight for reset time
        const nextMidnight = new Date(todayMidnight);
        nextMidnight.setDate(nextMidnight.getDate() + 1);

        return {
            allowed: false,
            remaining: 0,
            resetAt: nextMidnight,
        };
    }

    // Increment counter
    const newCount = currentCount + 1;

    await User.updateOne(
        { email: session.user.email },
        {
            $set: {
                [`usage.${toolType}.count`]: newCount,
                [`usage.${toolType}.lastResetDate`]: needsReset ? now : usage.lastResetDate,
            },
        }
    );

    // Calculate next midnight for reset time
    const nextMidnight = new Date(todayMidnight);
    nextMidnight.setDate(nextMidnight.getDate() + 1);

    return {
        allowed: true,
        remaining: DAILY_LIMIT - newCount,
        resetAt: nextMidnight,
    };
}

/**
 * Middleware helper to check rate limit and return 429 if exceeded.
 * Call at the start of API routes that need rate limiting.
 */
export async function withRateLimit(
    toolType: ToolType,
    timezone?: string
): Promise<{ error?: Response; result?: RateLimitResult }> {
    try {
        const result = await checkRateLimit(toolType, timezone);

        if (!result.allowed) {
            return {
                error: new Response(
                    JSON.stringify({
                        error: "Daily usage limit reached. Please try again tomorrow.",
                        code: "RATE_LIMIT_EXCEEDED",
                        remaining: 0,
                        resetAt: result.resetAt.toISOString(),
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "X-RateLimit-Limit": String(DAILY_LIMIT),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": result.resetAt.toISOString(),
                        },
                    }
                ),
            };
        }

        return { result };
    } catch (error) {
        if ((error as Error).message === "Unauthorized") {
            return {
                error: new Response(
                    JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
                    { status: 401, headers: { "Content-Type": "application/json" } }
                ),
            };
        }

        return {
            error: new Response(
                JSON.stringify({ error: "Internal server error", code: "SERVER_ERROR" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            ),
        };
    }
}
