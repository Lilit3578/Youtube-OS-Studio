import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import Sidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

// This is a Server Component
export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect(config.auth.loginUrl);
    }

    return (
        <div className="flex h-screen bg-base-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
