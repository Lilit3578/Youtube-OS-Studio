import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMongo } from "rate-limiter-flexible";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import logger from "@/libs/logger";

// Global cache for limiters to prevent re-initialization on hot reloads
const limiters: Record<string, RateLimiterMongo> = {};

interface RateLimitOptions {
    keyPrefix: string;
    points: number; // Number of requests
    duration: number; // Per seconds
}

export const getRateLimiter = async ({
    keyPrefix,
    points,
    duration,
}: RateLimitOptions) => {
    if (limiters[keyPrefix]) return limiters[keyPrefix];

    try {
        await connectMongo();

        // Only initialize if we have a connection
        if (mongoose.connection.readyState === 1) {
            limiters[keyPrefix] = new RateLimiterMongo({
                storeClient: mongoose.connection,
                keyPrefix,
                points,
                duration,
            });
        }
    } catch (error) {
        logger.error({ error, keyPrefix }, "Failed to init rate limiter");
    }

    return limiters[keyPrefix];
};

/**
 * Helper to check rate limit in API routes.
 * Returns null if allowed, or a NextResponse if blocked/error.
 */
export const checkRateLimit = async (
    req: NextRequest,
    config: RateLimitOptions = {
        keyPrefix: "common_limiter",
        points: 10,
        duration: 60,
    }
): Promise<NextResponse | null> => {
    try {
        const limiter = await getRateLimiter(config);

        // Fail Open: If limiter init failed (e.g. DB down), just allow traffic
        if (!limiter) return null;

        // Use IP from headers or a fallback
        // In production (Vercel/AWS), x-forwarded-for is standard.
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

        await limiter.consume(ip);

        return null;
    } catch (rejRes) {
        // Check if it's a rate limiter rejection (has msBeforeNext)
        if (rejRes instanceof Error) {
            logger.error({ error: rejRes }, "Runtime Error in Rate Limiter");
            // Don't crash the request for an internal error
            return null;
        }

        // It is a rate limit error
        return NextResponse.json(
            { error: "Too Many Requests. Please try again later." },
            { status: 429 }
        );
    }
};
