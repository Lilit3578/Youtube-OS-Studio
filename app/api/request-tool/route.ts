import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            toolName,
            problemDescription,
            usageDescription,
            frequency,
            priority,
            similarTools,
            contactConsent,
        } = body;

        // Validation
        if (!toolName || !problemDescription || !frequency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Send email to admin
        await resend.emails.send({
            from: "YouTube OS <noreply@yourdomain.com>",
            to: process.env.ADMIN_EMAIL!,
            subject: `New Tool Request: ${toolName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #171717;">New Tool Request Submitted</h2>
                    
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #171717; margin-top: 0;">Requested By:</h3>
                        <p style="margin: 8px 0;"><strong>Name:</strong> ${session.user.name || 'N/A'}</p>
                        <p style="margin: 8px 0;"><strong>Email:</strong> ${session.user.email}</p>
                        <p style="margin: 8px 0;"><strong>Contact Consent:</strong> ${contactConsent ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
                    
                    <h3 style="color: #171717;">Tool Details:</h3>
                    
                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Tool Name:</strong></p>
                        <p style="margin: 8px 0; color: #525252;">${toolName}</p>
                    </div>
                    
                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Problem it solves:</strong></p>
                        <p style="margin: 8px 0; color: #525252;">${problemDescription}</p>
                    </div>
                    
                    ${usageDescription ? `
                        <div style="margin: 16px 0;">
                            <p style="margin: 8px 0;"><strong>How they would use it:</strong></p>
                            <p style="margin: 8px 0; color: #525252;">${usageDescription}</p>
                        </div>
                    ` : ''}
                    
                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Frequency:</strong> <span style="text-transform: capitalize;">${frequency}</span></p>
                        ${priority ? `<p style="margin: 8px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>` : ''}
                        ${similarTools ? `<p style="margin: 8px 0;"><strong>Similar Tools:</strong> ${similarTools}</p>` : ''}
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
                    
                    <p style="color: #737373; font-size: 12px;">Submitted: ${new Date().toLocaleString()}</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting tool request:", error);
        return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }
}
