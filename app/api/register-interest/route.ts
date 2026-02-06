import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { Resend } from "resend";
import { z } from "zod";
import config, { toolsConfig } from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const VALID_TOOL_IDS = toolsConfig
    .filter((t) => t.status === "coming-soon" && t.href !== "#")
    .map((t) => t.id);

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

const requestSchema = z.object({
    toolId: z.string().min(1, "Tool ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const validation = requestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { toolId } = validation.data;

        if (!VALID_TOOL_IDS.includes(toolId)) {
            return NextResponse.json(
                { error: "Invalid tool ID" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Add interest atomically (only if not already registered)
        const result = await User.findOneAndUpdate(
            { email: session.user.email },
            { $addToSet: { interests: toolId } },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Count total users who have registered interest in this tool
        const totalInterested = await User.countDocuments({
            interests: toolId,
        });

        // Get the tool name for the email
        const tool = toolsConfig.find((t) => t.id === toolId);
        const toolName = tool ? tool.name : toolId;

        // Notify admin
        if (process.env.ADMIN_EMAIL) {
            await resend.emails.send({
                from: config.resend.fromNoReply,
                to: process.env.ADMIN_EMAIL,
                subject: `Interest Registered: ${escapeHtml(toolName)} (${totalInterested} total)`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #171717;">New Interest Registration</h2>

                        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 8px 0;"><strong>Tool:</strong> ${escapeHtml(toolName)}</p>
                            <p style="margin: 8px 0;"><strong>User:</strong> ${escapeHtml(session.user.name || "N/A")} (${escapeHtml(session.user.email)})</p>
                        </div>

                        <div style="background: #0A68F5; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <p style="margin: 0; font-size: 32px; font-weight: bold;">${totalInterested}</p>
                            <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">total users interested</p>
                        </div>

                        <p style="color: #737373; font-size: 12px;">Registered: ${new Date().toISOString()}</p>
                    </div>
                `,
            });
        }

        return NextResponse.json({
            success: true,
            totalInterested,
        });
    } catch (error) {
        console.error("Error registering interest:", error);
        return NextResponse.json(
            { error: "Failed to register interest" },
            { status: 500 }
        );
    }
}

/** GET: Check if current user has registered interest in a tool */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const toolId = req.nextUrl.searchParams.get("toolId");
        if (!toolId) {
            return NextResponse.json(
                { error: "toolId query parameter is required" },
                { status: 400 }
            );
        }

        await connectMongo();

        const user = await User.findOne({ email: session.user.email }).select(
            "interests"
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const registered = user.interests?.includes(toolId) || false;

        return NextResponse.json({ registered });
    } catch (error) {
        console.error("Error checking interest:", error);
        return NextResponse.json(
            { error: "Failed to check interest" },
            { status: 500 }
        );
    }
}
