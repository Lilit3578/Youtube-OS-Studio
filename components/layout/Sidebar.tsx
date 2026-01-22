"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import config, { toolsConfig } from "@/config";
import {
    PanelLeft,
    Home,
    BarChart,
    MessageSquare,
    Image as ImageIcon,
    QrCode,
    User,
    Settings,
    Lock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { useState, useEffect, ReactNode } from "react";

// --- Minimal Shadcn-like Components ---

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function Button({
    className,
    variant = "default",
    size = "default",
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "secondary";
    size?: "default" | "sm" | "icon";
}) {
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    };

    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        icon: "h-9 w-9",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("shrink-0 bg-slate-200 h-[1px] w-full", className)} {...props} />
    );
}

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
    if (disabled) {
        return (
            <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-base-content/40 cursor-not-allowed">
                {icon}
                <span>{label}</span>
            </div>
        );
    }

    const content = (
        <div
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-base-200 hover:text-base-content",
                active && "bg-base-200 text-base-content"
            )}
        >
            {icon}
            <span>{label}</span>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <div className="px-3 py-2 text-xs font-medium text-base-content/40 uppercase tracking-wider">
            {children}
        </div>
    );
}

// --- Main Sidebar Component ---

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Map tool IDs to Lucide icons
    const getToolIcon = (id: string) => {
        switch (id) {
            case "metadata": return <BarChart className="h-4 w-4" />;
            case "comments": return <MessageSquare className="h-4 w-4" />;
            case "thumbnail": return <ImageIcon className="h-4 w-4" />;
            case "qr": return <QrCode className="h-4 w-4" />;
            default: return <Lock className="h-4 w-4" />;
        }
    };

    return (
        <aside className="hidden lg:flex flex-col h-full w-72 bg-base-100 p-4 border-r border-base-200">
            {/* Header */}
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-xl leading-none">
                    <span className="font-serif italic text-base-content">youtube</span>{" "}
                    <span className="font-serif text-base-content">OS</span>
                </div>

                <Button variant="ghost" size="icon">
                    <PanelLeft className="h-4 w-4" />
                </Button>
            </div>

            <Separator className="my-3 opacity-10 bg-base-content" />

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

                <SidebarItem label="ai script writer" icon={<Lock className="h-4 w-4" />} disabled />
                <SidebarItem label="channel audit" icon={<Lock className="h-4 w-4" />} disabled />
                <SidebarItem label="competitor analysis" icon={<Lock className="h-4 w-4" />} disabled />
            </nav>

            <Separator className="my-3 opacity-10 bg-base-content" />

            {/* CTA */}
            <Button className="mb-3 w-full rounded-full text-xs uppercase bg-neutral text-neutral-content hover:bg-neutral/90">
                request tool
            </Button>

            <Separator className="my-3 opacity-10 bg-base-content" />

            {/* Footer */}
            <div className="flex flex-col gap-1">
                <SidebarItem
                    label={session?.user?.name?.toLowerCase() || "user"}
                    icon={<User className="h-4 w-4" />}
                />
                <SidebarItem
                    label="settings"
                    icon={<Settings className="h-4 w-4" />}
                    active={pathname === "/dashboard/settings"}
                    href="/dashboard/settings"
                />
            </div>
        </aside>
    );
};

export default Sidebar;
