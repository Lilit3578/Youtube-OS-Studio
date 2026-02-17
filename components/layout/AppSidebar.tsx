"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Monitor, MessageSquare, ImageIcon, QrCode, Sparkles, Settings } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toolsConfig } from "@/config";
import RequestToolModal from "@/components/modals/RequestToolModal";
import ButtonAccount from "@/components/ButtonAccount";

export function AppSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    // Request tool modal state
    const [requestToolModalOpen, setRequestToolModalOpen] = useState(false);

    // Map tool IDs to Lucide icons
    const getToolIcon = (id: string) => {
        switch (id) {
            case "metadata": return <Monitor />;
            case "comments": return <MessageSquare />;
            case "thumbnail": return <ImageIcon />;
            case "qr": return <QrCode />;
            default: return <Sparkles />;
        }
    };



    return (
        <>
            <Sidebar collapsible="icon" className="bg-ink-200 border-r border-ink-300 flex flex-col px-4 py-3">
                <SidebarHeader className="group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center justify-between w-full">
                        {!isCollapsed && (
                            <div className="h2"><span className="italic">youtube </span>OS
                            </div>
                        )}
                        {!isCollapsed && <SidebarTrigger />}
                        {isCollapsed && (
                            <div>
                                <SidebarTrigger />
                            </div>
                        )}
                    </div>
                </SidebarHeader>

                <Separator />

                <SidebarContent>
                    {/* Main Navigation */}
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                                    <a href="/dashboard">
                                        <Home /><div>home</div>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Tools */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-2.5 py-1 text-ink-700 h-auto group-data-[collapsible=icon]:hidden">tools</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "active").map(tool => (
                                    <SidebarMenuItem key={tool.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname.startsWith(tool.href)}
                                        >
                                            <a href={tool.href}>
                                                {getToolIcon(tool.id)}
                                                <div className="body">{tool.name}</div>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Coming Soon */}
                    <SidebarGroup className="flex-1">
                        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">coming soon</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "coming-soon").map(tool => {
                                    const hasPage = tool.href !== "#";
                                    return (
                                        <SidebarMenuItem key={tool.id}>
                                            {hasPage ? (
                                                <SidebarMenuButton disabled
                                                    asChild
                                                    isActive={pathname.startsWith(tool.href)}
                                                >
                                                    <Link href={tool.href}>
                                                        {getToolIcon(tool.id)}
                                                        <div>{tool.name}</div>
                                                    </Link>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton disabled>
                                                    {getToolIcon(tool.id)}
                                                    <div>{tool.name}</div>
                                                </SidebarMenuButton>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <Separator />

                    {/* Request Tool Button */}
                    <div className="group-data-[collapsible=icon]:hidden">
                        <Button
                            onClick={() => setRequestToolModalOpen(true)}
                            variant="default"
                            className="w-full uppercase cursor-pointer"
                        >
                            Request Tool
                        </Button>
                    </div>
                </SidebarContent>

                <Separator />

                <SidebarFooter>
                    {/* User & Settings */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                                <Link href="/dashboard/settings">
                                    <Settings />
                                    <div>settings</div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem className="flex justify-center">
                            <ButtonAccount />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Request Tool Modal */}
            <RequestToolModal
                isOpen={requestToolModalOpen}
                onClose={() => setRequestToolModalOpen(false)}
            />


        </>
    );
}
