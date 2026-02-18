import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";

// Metadata tool is coming soon — this route is a placeholder
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
