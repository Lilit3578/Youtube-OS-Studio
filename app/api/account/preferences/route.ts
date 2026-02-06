import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { z } from "zod";

const preferencesSchema = z.object({
    exportFormat: z.enum(["csv", "xlsx", "json"]).optional(),
    dateFormat: z.enum(["us", "eu", "iso"]).optional(),
    timezone: z.enum(["utc", "local", "pst", "est", "cet"]).optional(),
    notifications: z
        .object({
            toolCompletion: z.boolean().optional(),
            newFeatures: z.boolean().optional(),
            marketing: z.boolean().optional(),
        })
        .optional(),
    analyticsOptIn: z.boolean().optional(),
});

/** GET: Retrieve current user preferences */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();
        const user = await User.findOne({ email: session.user.email }).select(
            "preferences"
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: user.preferences || {} });
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return NextResponse.json(
            { error: "Failed to fetch preferences" },
            { status: 500 }
        );
    }
}

/** PUT: Update user preferences */
export async function PUT(req: NextRequest) {
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

        const validation = preferencesSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const prefs = validation.data;

        await connectMongo();

        // Build $set object for only the provided fields
        const setFields: Record<string, any> = {};
        if (prefs.exportFormat !== undefined)
            setFields["preferences.exportFormat"] = prefs.exportFormat;
        if (prefs.dateFormat !== undefined)
            setFields["preferences.dateFormat"] = prefs.dateFormat;
        if (prefs.timezone !== undefined)
            setFields["preferences.timezone"] = prefs.timezone;
        if (prefs.analyticsOptIn !== undefined)
            setFields["preferences.analyticsOptIn"] = prefs.analyticsOptIn;
        if (prefs.notifications) {
            if (prefs.notifications.toolCompletion !== undefined)
                setFields["preferences.notifications.toolCompletion"] =
                    prefs.notifications.toolCompletion;
            if (prefs.notifications.newFeatures !== undefined)
                setFields["preferences.notifications.newFeatures"] =
                    prefs.notifications.newFeatures;
            if (prefs.notifications.marketing !== undefined)
                setFields["preferences.notifications.marketing"] =
                    prefs.notifications.marketing;
        }

        if (Object.keys(setFields).length === 0) {
            return NextResponse.json(
                { error: "No valid preferences provided" },
                { status: 400 }
            );
        }

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: setFields },
            { new: true }
        ).select("preferences");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: user.preferences });
    } catch (error) {
        console.error("Error saving preferences:", error);
        return NextResponse.json(
            { error: "Failed to save preferences" },
            { status: 500 }
        );
    }
}
