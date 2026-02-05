"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toolsConfig } from "@/config";
import HelpModal from "@/components/modals/HelpModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
            <div className="w-full flex items-center justify-between bg-transparent min-h-[4rem] px-8 pt-6 pb-2">
                <div className="h2 text-foreground italic">
                    {getPageTitle()}
                </div>

                {showHelpButton && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsHelpOpen(true)}
                        className="flex items-center gap-2 px-[10px] py-[6px] rounded-[8px]"
                    >
                        <HelpCircle className="h-4 w-4" />
                        <span className="body text-foreground">
                            help
                        </span>
                    </Button>
                )}
            </div>

            {toolId && (
                <HelpModal
                    isOpen={isHelpOpen}
                    onClose={() => setIsHelpOpen(false)}
                    toolId={toolId}
                />
            )}

            <Separator className="my-3 opacity-30" />
        </>
    );
};

export default AppHeader;
