"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toolsConfig } from "@/config";
import HelpModal from "@/components/modals/HelpModal";
import { Button } from "@/components/ui/button";
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
            <div className="w-full flex items-center justify-between bg-transparent px-10 py-3.5 border-b border-ink-200">
                <div className="h2 italic">
                    {getPageTitle()}
                </div>

                {showHelpButton && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsHelpOpen(true)}
                        className="gap-2 cursor-pointer h-auto"
                    >
                        <HelpCircle />
                        help
                    </Button>
                )}
            </div>

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
