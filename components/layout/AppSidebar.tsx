"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Monitor, MessageSquare, ImageIcon, QrCode, Sparkles, Settings, PanelLeft } from "lucide-react";
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
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toolsConfig } from "@/config";
import RequestToolModal from "@/components/modals/RequestToolModal";
import ButtonAccount from "@/components/ButtonAccount";
import { cn } from "@/libs/utils";

export function AppSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

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
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader className="px-3 pt-8 pb-4">
                    <div className="flex items-center justify-center w-full">
                        {!isCollapsed && (
                            <div className="h2 text-foreground italic flex items-center gap-1 mr-auto pl-2">
                                <span>youtube</span>
                                <span>OS</span>
                            </div>
                        )}
                        <SidebarTrigger className={cn(isCollapsed ? "" : "ml-auto")} />
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-2 overflow-hidden group-data-[collapsible=icon]:px-0">
                    {/* Main Navigation */}
                    <SidebarGroup className="p-2 group-data-[collapsible=icon]:p-0">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                                    <Link href="/dashboard">
                                        <Home />
                                        <span>home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Tools */}
                    <SidebarGroup className="p-1 group-data-[collapsible=icon]:p-0">
                        <SidebarGroupLabel className="px-3 pt-4 pb-1 text-muted-foreground italic h-auto group-data-[collapsible=icon]:hidden">tools</SidebarGroupLabel>
                        <SidebarGroupContent className="group-data-[collapsible=icon]:p-0">
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "active").map(tool => (
                                    <SidebarMenuItem key={tool.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname.startsWith(tool.href)}
                                        >
                                            <Link href={tool.href}>
                                                {getToolIcon(tool.id)}
                                                <span>{tool.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Coming Soon */}
                    <SidebarGroup className="p-1 group-data-[collapsible=icon]:p-0">
                        <SidebarGroupLabel className="px-3 pt-4 pb-1 text-muted-foreground italic h-auto group-data-[collapsible=icon]:hidden">coming soon</SidebarGroupLabel>
                        <SidebarGroupContent className="group-data-[collapsible=icon]:p-0">
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "coming-soon").map(tool => {
                                    const hasPage = tool.href !== "#";
                                    return (
                                        <SidebarMenuItem key={tool.id}>
                                            {hasPage ? (
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={pathname.startsWith(tool.href)}
                                                    className="opacity-60 hover:opacity-100"
                                                >
                                                    <Link href={tool.href}>
                                                        {getToolIcon(tool.id)}
                                                        <span>{tool.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton disabled>
                                                    {getToolIcon(tool.id)}
                                                    <span>{tool.name}</span>
                                                </SidebarMenuButton>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Request Tool Button */}
                    <div className="px-3 py-4 group-data-[collapsible=icon]:hidden">
                        <Button
                            onClick={() => setRequestToolModalOpen(true)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider cursor-pointer"
                        >
                            Request Tool
                        </Button>
                    </div>
                </SidebarContent>

                <SidebarSeparator className="my-6 opacity-30" />

                <SidebarFooter>
                    <SidebarSeparator className="my-3 opacity-10" />

                    {/* User & Settings */}
                    <SidebarMenu>
                        <SidebarMenuItem className="flex justify-center">
                            <ButtonAccount />
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} className="normal-case">
                                <Link href="/dashboard/settings">
                                    <Settings className="h-4 w-4" />
                                    <span>settings</span>
                                </Link>
                            </SidebarMenuButton>
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
