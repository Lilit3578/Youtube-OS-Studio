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
 * Get UTC midnight for a given date
 * Always use UTC to prevent timezone manipulation attacks
 */
function getUTCMidnight(date: Date): Date {
    const midnight = new Date(date);
    midnight.setUTCHours(0, 0, 0, 0);
    return midnight;
}

/**
 * Get next UTC midnight
 */
function getNextUTCMidnight(date: Date): Date {
    const midnight = getUTCMidnight(date);
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    return midnight;
}

/**
 * Check if user is within rate limit and increment usage if allowed.
 * Resets at UTC midnight (server-controlled, not user-controlled).
 */
export async function checkRateLimit(
    toolType: ToolType
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
    const usage = user.usage?.[toolType] || {
        count: 0,
        lastResetDate: new Date(),
    };
    const lastReset = new Date(usage.lastResetDate);

    const now = new Date();
    const todayMidnight = getUTCMidnight(now);
    const lastResetMidnight = getUTCMidnight(lastReset);

    // Check if we need to reset (different UTC day)
    const needsReset = lastResetMidnight < todayMidnight;

    let currentCount = usage.count;

    if (needsReset) {
        currentCount = 0;
    }

    // Check if within limit
    if (currentCount >= DAILY_LIMIT) {
        const nextMidnight = getNextUTCMidnight(now);

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
                [`usage.${toolType}.lastResetDate`]: needsReset ? now : lastReset,
            },
        }
    );

    const nextMidnight = getNextUTCMidnight(now);

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
    toolType: ToolType
): Promise<{ error?: Response; result?: RateLimitResult }> {
    try {
        const result = await checkRateLimit(toolType);

        if (!result.allowed) {
            return {
                error: new Response(
                    JSON.stringify({
                        error: "Daily usage limit reached. Resets at midnight UTC.",
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
                JSON.stringify({
                    error: "Internal server error",
                    code: "SERVER_ERROR",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            ),
        };
    }
}
