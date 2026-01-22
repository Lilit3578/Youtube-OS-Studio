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
        <header className="w-full flex items-center px-[20px] py-[2px] justify-between bg-transparent min-h-[4rem] px-8 pt-6 pb-2">
            <div className="font-serif text-[20px] italic font-normal leading-[28px] text-[#141414]">
                {getPageTitle()}
            </div>

            <Link
                href="/help"
                className="flex items-center gap-2 px-[10px] py-[6px] rounded-[8px] hover:bg-neutral-100 transition-colors group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#141414]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                </svg>
                <span className="font-sans text-[14px] font-normal leading-[23.8px] text-[#141414]">
                    help
                </span>
            </Link>
        </header>
    );
};

export default AppHeader;
