import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMongo, RateLimiterMemory } from "rate-limiter-flexible";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import logger from "@/libs/logger";

// Global cache for limiters to prevent re-initialization on hot reloads
const limiters: Record<string, RateLimiterMongo> = {};

// In-memory fallback limiters — activated when MongoDB is unavailable.
// These are intentionally more permissive (reset on server restart, not
// shared across instances) but prevent the endpoint from failing fully open.
const memoryFallbacks: Record<string, RateLimiterMemory> = {};

interface RateLimitOptions {
    keyPrefix: string;
    points: number; // Number of requests
    duration: number; // Per seconds
}

const getMemoryFallback = (config: RateLimitOptions): RateLimiterMemory => {
    if (!memoryFallbacks[config.keyPrefix]) {
        memoryFallbacks[config.keyPrefix] = new RateLimiterMemory({
            keyPrefix: config.keyPrefix,
            points: config.points,
            duration: config.duration,
        });
    }
    return memoryFallbacks[config.keyPrefix];
};

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
 *
 * Uses MongoDB-backed rate limiting when available.
 * Falls back to an in-memory limiter if MongoDB is unavailable,
 * ensuring the endpoint is never fully unprotected.
 */
export const checkRateLimit = async (
    req: NextRequest,
    config: RateLimitOptions = {
        keyPrefix: "common_limiter",
        points: 10,
        duration: 60,
    }
): Promise<NextResponse | null> => {
    // Use IP from headers or a fallback
    // In production (Vercel/AWS), x-forwarded-for is standard.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    try {
        const limiter = await getRateLimiter(config);

        if (limiter) {
            // DB-backed limiter available — use it
            await limiter.consume(ip);
            return null;
        }

        // DB unavailable — fall back to in-memory limiter
        logger.warn({ keyPrefix: config.keyPrefix }, "MongoDB rate limiter unavailable, using in-memory fallback");
        const fallback = getMemoryFallback(config);
        await fallback.consume(ip);
        return null;

    } catch (rejRes) {
        // Check if it's a rate limiter rejection (has msBeforeNext)
        if (rejRes instanceof Error) {
            logger.error({ error: rejRes }, "Runtime Error in Rate Limiter");
            // Don't crash the request for an internal error
            return null;
        }

        // It is a rate limit rejection
        return NextResponse.json(
            { error: "Too Many Requests. Please try again later." },
            { status: 429 }
        );
    }
};
