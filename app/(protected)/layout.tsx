import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import { AppSidebar } from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

// This is a Server Component
export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect(config.auth.loginUrl);
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 overflow-y-auto px-10 py-5">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
