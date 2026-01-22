"use client";

import { usePathname } from "next/navigation";
import { toolsConfig } from "@/config";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const AppHeader = () => {
    const pathname = usePathname();

    // Determine title based on current path
    const getPageTitle = () => {
        if (pathname === "/dashboard") return "home";
        if (pathname === "/dashboard/settings") return "settings";

        const activeTool = toolsConfig.find(tool => pathname.startsWith(tool.href));
        return activeTool ? activeTool.name : "";
    };

    return (
        <header className="navbar min-h-[4rem] px-8 pt-6 pb-2 justify-between bg-transparent">
            <div className="flex-1">
                <span className="font-serif text-2xl italic tracking-tight">{getPageTitle()}</span>
            </div>
            <div className="flex-none">
                <Link href="/help" className="flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                    help
                </Link>
            </div>
            <Separator />
        </header>
    );
};

export default AppHeader;
