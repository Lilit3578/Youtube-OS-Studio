"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toolsConfig } from "@/config";
import HelpModal from "@/components/modals/HelpModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HelpCircle } from "lucide-react";

const AppHeader = () => {
    const pathname = usePathname();
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Determine title based on current path
    const getPageTitle = () => {
        if (pathname === "/dashboard") return "home";
        if (pathname === "/dashboard/settings") return "settings";

        const activeTool = toolsConfig.find(tool => pathname.startsWith(tool.href));
        return activeTool ? activeTool.name : "";
    };

    // Get current tool ID for help modal
    const getCurrentToolId = () => {
        const activeTool = toolsConfig.find(tool => pathname.startsWith(tool.href));
        return activeTool?.id || null;
    };

    const toolId = getCurrentToolId();
    const showHelpButton = toolId !== null;

    return (
        <>
            <div className="w-full flex items-center justify-between bg-transparent px-[40px] py-[16px]">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-serif italic text-ink-1000">
                        {getPageTitle()}
                    </div>
                </div>

                {showHelpButton && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsHelpOpen(true)}
                        className="gap-2 cursor-pointer px-[10px] py-[6px] h-auto font-normal text-sm !normal-case"
                    >
                        <HelpCircle className="h-5 w-5" />
                        help
                    </Button>
                )}
            </div>

            <Separator className="bg-ink-200" />

            {/* Help Modal */}
            {toolId && (
                <HelpModal
                    isOpen={isHelpOpen}
                    onClose={() => setIsHelpOpen(false)}
                    toolId={toolId}
                />
            )}
        </>
    );
};

export default AppHeader;
