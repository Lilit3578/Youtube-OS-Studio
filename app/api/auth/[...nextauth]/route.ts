import { handlers } from "@/libs/next-auth";
import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMongo } from "rate-limiter-flexible";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";

// Initialize rate limiter
let rateLimiter: RateLimiterMongo | null = null;

const getRateLimiter = async () => {
    if (rateLimiter) return rateLimiter;

    try {
        await connectMongo();

        // Only initialize if we have a connection
        if (mongoose.connection.readyState === 1) {
            rateLimiter = new RateLimiterMongo({
                storeClient: mongoose.connection,
                keyPrefix: "middleware_limiter",
                points: 20, // RELAXED: 20 requests
                duration: 5, // per 5 seconds
            });
        }
    } catch (error) {
        console.error("Failed to init rate limiter:", error);
    }

    return rateLimiter;
};

const withRateLimit = (handler: any) => async (req: NextRequest, ctx: any) => {
    try {
        const limiter = await getRateLimiter();

        // Fail Open: If limiter init failed, just proceed
        if (limiter) {
            // Use IP from headers or a fallback
            const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
            await limiter.consume(ip);
        }

        return handler(req, ctx);
    } catch (rejRes) {
        // Check if it's a rate limiter rejection (has msBeforeNext)
        if (rejRes instanceof Error) {
            // It's a real code error! Don't swallow it.
            console.error("Runtime Error in API Route Wrapper:", rejRes);
            throw rejRes; // Let Next.js handle the crash/error
        }

        // It is a rate limit error
        return NextResponse.json(
            { error: "Too Many Requests" },
            { status: 429 }
        );
    }
};

export const GET = withRateLimit(handlers.GET);
export const POST = withRateLimit(handlers.POST);
