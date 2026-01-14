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
        <div className="flex h-screen bg-base-100">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
