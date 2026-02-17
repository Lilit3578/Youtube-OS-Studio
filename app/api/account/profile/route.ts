import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { z } from "zod";
import logger from "@/libs/logger";

const profileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
    email: z.string().email("Invalid email address").optional(),
});

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

        const validation = profileSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email } = validation.data;

        await connectMongo();

        // If email is being changed, check if it's already taken
        if (email && email !== session.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 400 }
                );
            }
        }

        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No changes provided" },
                { status: 400 }
            );
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        ).select("name email");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: updatedUser });
    } catch (error: any) {
        logger.error({
            error,
            user: (await auth())?.user?.email
        }, "[PROFILE_UPDATE_ERROR]");
        return NextResponse.json(
            { error: "Failed to update profile. Please try again later." },
            { status: 500 }
        );
    }
}
