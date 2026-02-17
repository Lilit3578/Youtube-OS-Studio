import { handlers } from "@/libs/next-auth";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/libs/rate-limit";

const withRateLimit = (handler: any) => async (req: NextRequest, ctx: any) => {
    // Shared limiter for auth routes
    // 20 requests per 5 seconds
    const limitResult = await checkRateLimit(req, {
        keyPrefix: "middleware_limiter",
        points: 20,
        duration: 5,
    });

    if (limitResult) return limitResult;

    return handler(req, ctx);
};

export const GET = withRateLimit(handlers.GET);
export const POST = withRateLimit(handlers.POST);
