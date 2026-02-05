"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import config, { toolsConfig } from "@/config";
import {
    PanelLeft,
    Home,
    Monitor,
    MessageSquare,
    Image as ImageIcon,
    QrCode,
    User,
    Settings,
    Sparkles
} from "lucide-react";
import React, { useState, useRef, ReactNode } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import UserPopover from "@/components/UserPopover";
import RequestToolModal from "@/components/modals/RequestToolModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/libs/utils";

// --- Sidebar Specific Components ---

function SidebarItem({
    label,
    icon,
    active,
    disabled,
    href
}: {
    label: string;
    icon: ReactNode;
    active?: boolean;
    disabled?: boolean;
    href?: string;
}) {
    const { isCollapsed } = useSidebar();

    const buttonContent = (
        <Button
            variant="ghost"
            disabled={disabled}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 body-strong w-full justify-start",
                active && "bg-accent text-accent-foreground",
                disabled && "text-neutral-400 cursor-not-allowed",
                isCollapsed && "justify-center px-2"
            )}
            asChild={!!href && !disabled}
        >
            {href && !disabled ? (
                <Link href={href}>
                    {icon}
                    {!isCollapsed && <span>{label}</span>}
                </Link>
            ) : (
                <>
                    {icon}
                    {!isCollapsed && <span>{label}</span>}
                </>
            )}
        </Button>
    );

    return buttonContent;
}

function SectionLabel({ children }: { children: ReactNode }) {
    const { isCollapsed } = useSidebar();

    if (isCollapsed) return null;

    return (
        <div className="px-3 py-2 label text-muted-foreground">
            {children}
        </div>
    );
}

// --- Main Sidebar Component ---

const Sidebar = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const pathname = usePathname();
    const { data: session } = useSession();

    // User popover state
    const [userPopoverOpen, setUserPopoverOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const userItemRef = useRef<HTMLDivElement>(null);

    // Request tool modal state
    const [requestToolModalOpen, setRequestToolModalOpen] = useState(false);

    // Map tool IDs to Lucide icons
    const getToolIcon = (id: string) => {
        switch (id) {
            case "metadata": return <Monitor className="h-4 w-4" />;
            case "comments": return <MessageSquare className="h-4 w-4" />;
            case "thumbnail": return <ImageIcon className="h-4 w-4" />;
            case "qr": return <QrCode className="h-4 w-4" />;
            default: return <Sparkles className="h-4 w-4" />;
        }
    };

    return (
        <aside className={cn(
            "hidden lg:flex flex-col h-full bg-background p-4 border-r border-border transition-all duration-300",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center mb-2 px-4",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <div className="h2 text-foreground italic">
                        <span>youtube</span>{" "}
                        <span>OS</span>
                    </div>
                )}

                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <PanelLeft className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isCollapsed && "rotate-180"
                    )} />
                </Button>
            </div>

            <Separator className="my-3 opacity-30" />

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
                <SidebarItem
                    label="home"
                    icon={<Home className="h-4 w-4" />}
                    active={pathname === "/dashboard"}
                    href="/dashboard"
                />

                <SectionLabel>tools</SectionLabel>

                {toolsConfig.filter(t => t.status === "active").map(tool => (
                    <SidebarItem
                        key={tool.id}
                        label={tool.name}
                        icon={getToolIcon(tool.id)}
                        active={pathname.startsWith(tool.href)}
                        href={tool.href}
                    />
                ))}

                <SectionLabel>coming soon</SectionLabel>

                <SidebarItem label="lorem ipsum" icon={<Sparkles className="h-4 w-4" />} disabled />
                <SidebarItem label="lorem ipsum" icon={<Sparkles className="h-4 w-4" />} disabled />
                <SidebarItem label="lorem ipsum" icon={<Sparkles className="h-4 w-4" />} disabled />
            </nav>

            <Separator className="my-3 opacity-10" />

            {/* CTA */}
            {!isCollapsed && (
                <Button
                    onClick={() => setRequestToolModalOpen(true)}
                    className="mb-3 w-full rounded-full label bg-neutral text-neutral-content hover:bg-neutral/90 cursor-pointer"
                >
                    request tool
                </Button>
            )}

            <Separator className="my-3 opacity-10" />

            {/* Footer */}
            <div className="flex flex-col gap-1 relative">
                <div
                    ref={userItemRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (userItemRef.current) {
                            const rect = userItemRef.current.getBoundingClientRect();
                            setPopoverPosition({
                                top: window.innerHeight - rect.top + 8,
                                left: rect.left
                            });
                        }
                        setUserPopoverOpen(!userPopoverOpen);
                    }}
                    className="cursor-pointer"
                >
                    <SidebarItem
                        label={session?.user?.name?.toLowerCase() || "user"}
                        icon={<User className="h-4 w-4" />}
                    />
                </div>
                <SidebarItem
                    label="settings"
                    icon={<Settings className="h-4 w-4" />}
                    active={pathname === "/dashboard/settings"}
                    href="/dashboard/settings"
                />
            </div>

            {/* User Popover */}
            <UserPopover
                email={session?.user?.email || ""}
                name={session?.user?.name || "User"}
                isOpen={userPopoverOpen}
                onClose={() => setUserPopoverOpen(false)}
                position={popoverPosition}
            />

            {/* Request Tool Modal */}
            <RequestToolModal
                isOpen={requestToolModalOpen}
                onClose={() => setRequestToolModalOpen(false)}
            />
        </aside>
    );
};

export default Sidebar;
