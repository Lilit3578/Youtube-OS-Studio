import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    // Check if user is logged in
    if (!session?.user?.email) {
        redirect(config.auth.loginUrl);
    }

    // Check if user is the admin
    // You can support multiple admins by splitting string or using an array in config
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || session.user.email !== adminEmail) {
        // If not admin, redirect to home
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Custom Admin Header */}
            <div className="w-full flex items-center justify-between bg-background px-8 py-4 border-b border-ink-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="h2 italic text-ink-1000 hover:text-primary transition-colors">
                        Admin Dashboard
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/" className="label text-ink-600 hover:text-ink-1000 transition-colors">
                        Back to App
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
