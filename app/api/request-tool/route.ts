import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import { Resend } from "resend";
import { z } from "zod";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import logger from "@/libs/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escape HTML special characters to prevent injection in email templates */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

// Zod schema matching frontend constraints
const requestToolSchema = z.object({
    toolName: z
        .string()
        .min(1, "Tool name is required")
        .max(100, "Tool name must be 100 characters or less")
        .trim(),
    problemDescription: z
        .string()
        .min(1, "Problem description is required")
        .max(500, "Problem description must be 500 characters or less")
        .trim(),
    usageDescription: z
        .string()
        .max(500, "Usage description must be 500 characters or less")
        .trim()
        .optional()
        .default(""),
    frequency: z.enum(["daily", "weekly", "monthly", "rarely"], {
        error: "Invalid frequency value",
    }),
    priority: z
        .enum(["critical", "high", "medium", "low"])
        .optional()
        .default("medium"),
    similarTools: z
        .string()
        .max(200, "Similar tools must be 200 characters or less")
        .trim()
        .optional()
        .default(""),
    contactConsent: z.boolean().optional().default(false),
});

const DAILY_REQUEST_LIMIT = 5;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse JSON body
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate with Zod
        const validation = requestToolSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Rate limiting: max 5 tool requests per user per day
        await connectMongo();
        const now = new Date();
        const startOfDay = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const requestUsage = user.usage?.toolRequests || {
            count: 0,
            lastResetDate: new Date(0),
        };
        const lastReset = new Date(requestUsage.lastResetDate);

        // Reset counter if it's a new day
        if (lastReset < startOfDay) {
            requestUsage.count = 0;
            requestUsage.lastResetDate = now;
        }

        if (requestUsage.count >= DAILY_REQUEST_LIMIT) {
            return NextResponse.json(
                { error: "Daily request limit reached. Please try again tomorrow." },
                { status: 429 }
            );
        }

        // Increment atomically
        await User.updateOne(
            { email: session.user.email },
            {
                $inc: { "usage.toolRequests.count": 1 },
                $set: { "usage.toolRequests.lastResetDate": now },
            }
        );

        // Sanitize all user-supplied fields before HTML interpolation
        const safe = {
            toolName: escapeHtml(data.toolName),
            problemDescription: escapeHtml(data.problemDescription),
            usageDescription: escapeHtml(data.usageDescription),
            frequency: escapeHtml(data.frequency),
            priority: escapeHtml(data.priority),
            similarTools: escapeHtml(data.similarTools),
            userName: escapeHtml(session.user.name || "N/A"),
            userEmail: escapeHtml(session.user.email || "N/A"),
        };

        // Send email to admin with sanitized content
        await resend.emails.send({
            from: config.resend.fromNoReply,
            to: process.env.ADMIN_EMAIL!,
            subject: `New Tool Request: ${safe.toolName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #171717;">New Tool Request Submitted</h2>

                    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #171717; margin-top: 0;">Requested By:</h3>
                        <p style="margin: 8px 0;"><strong>Name:</strong> ${safe.userName}</p>
                        <p style="margin: 8px 0;"><strong>Email:</strong> ${safe.userEmail}</p>
                        <p style="margin: 8px 0;"><strong>Contact Consent:</strong> ${data.contactConsent ? "Yes" : "No"}</p>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

                    <h3 style="color: #171717;">Tool Details:</h3>

                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Tool Name:</strong></p>
                        <p style="margin: 8px 0; color: #525252;">${safe.toolName}</p>
                    </div>

                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Problem it solves:</strong></p>
                        <p style="margin: 8px 0; color: #525252;">${safe.problemDescription}</p>
                    </div>

                    ${safe.usageDescription ? `
                        <div style="margin: 16px 0;">
                            <p style="margin: 8px 0;"><strong>How they would use it:</strong></p>
                            <p style="margin: 8px 0; color: #525252;">${safe.usageDescription}</p>
                        </div>
                    ` : ""}

                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Frequency:</strong> <span style="text-transform: capitalize;">${safe.frequency}</span></p>
                        ${safe.priority ? `<p style="margin: 8px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${safe.priority}</span></p>` : ""}
                        ${safe.similarTools ? `<p style="margin: 8px 0;"><strong>Similar Tools:</strong> ${safe.similarTools}</p>` : ""}
                    </div>

                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

                    <p style="color: #737373; font-size: 12px;">Submitted: ${new Date().toISOString()}</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error({ error }, "Error submitting tool request");
        return NextResponse.json(
            { error: "Failed to submit request" },
            { status: 500 }
        );
    }
}
