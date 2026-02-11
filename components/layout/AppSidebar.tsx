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
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
            case "metadata": return <Monitor className="size-5" />;
            case "comments": return <MessageSquare className="size-5" />;
            case "thumbnail": return <ImageIcon className="size-5" />;
            case "qr": return <QrCode className="size-5" />;
            default: return <Sparkles className="size-5" />;
        }
    };



    return (
        <>
            <Sidebar collapsible="icon" className="bg-ink-200 border-r border-ink-300">

                <SidebarHeader className="px-[40px] py-[16px] group-data-[collapsible=icon]:p-2">
                    <div className="flex items-center justify-between w-full">
                        {!isCollapsed && (
                            <div className="text-xl font-serif text-ink-1000 flex items-center">
                                <div className="italic">youtube </div>
                                <div>{" OS"}</div>
                            </div>
                        )}
                        {!isCollapsed && <SidebarTrigger />}
                        {isCollapsed && (
                            <div className="w-full flex justify-center">
                                <SidebarTrigger />
                            </div>
                        )}
                    </div>
                </SidebarHeader>


                <Separator className="opacity-30" />

                <SidebarContent className="px-4 overflow-hidden group-data-[collapsible=icon]:px-0">
                    {/* Main Navigation */}
                    <SidebarGroup className="p-0 pt-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} className="px-[10px] py-[6px] gap-2">
                                    <Link href="/dashboard" className="flex items-center gap-2">
                                        <Home className="size-5" />
                                        <div className="body">home</div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Tools */}
                    <SidebarGroup className="p-0 pt-4">
                        <SidebarGroupLabel className="px-[10px] py-[6px] text-ink-700 h-auto group-data-[collapsible=icon]:hidden">tools</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "active").map(tool => (
                                    <SidebarMenuItem key={tool.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname.startsWith(tool.href)}
                                            className="px-[10px] py-[6px] gap-2 data-[active=true]:bg-ink-200"
                                        >
                                            <Link href={tool.href} className="flex items-center gap-2">
                                                {getToolIcon(tool.id)}
                                                <div className="body">{tool.name}</div>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Coming Soon */}
                    <SidebarGroup className="p-0 pt-4 flex-1">
                        <SidebarGroupLabel className="px-[10px] py-[6px] text-ink-700 h-auto group-data-[collapsible=icon]:hidden">coming soon</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolsConfig.filter(t => t.status === "coming-soon").map(tool => {
                                    const hasPage = tool.href !== "#";
                                    return (
                                        <SidebarMenuItem key={tool.id}>
                                            {hasPage ? (
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={pathname.startsWith(tool.href)}
                                                    className="px-[10px] py-[6px] gap-2 opacity-60 hover:opacity-100"
                                                >
                                                    <Link href={tool.href} className="flex items-center gap-2">
                                                        {getToolIcon(tool.id)}
                                                        <div className="body">{tool.name}</div>
                                                    </Link>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton disabled className="px-[10px] py-[6px] gap-2">
                                                    {getToolIcon(tool.id)}
                                                    <div className="body">{tool.name}</div>
                                                </SidebarMenuButton>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <Separator className="opacity-30 group-data-[collapsible=icon]:hidden" />

                    {/* Request Tool Button */}
                    <div className="px-4 py-4 group-data-[collapsible=icon]:hidden">
                        <Button
                            onClick={() => setRequestToolModalOpen(true)}
                            variant="default"
                            className="w-full uppercase cursor-pointer"
                        >
                            Request Tool
                        </Button>
                    </div>
                </SidebarContent>

                <Separator className="opacity-30" />

                <SidebarFooter className="px-4 pb-4">
                    {/* User & Settings */}
                    <SidebarMenu>
                        <SidebarMenuItem className="flex justify-center">
                            <ButtonAccount />
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} className="px-[10px] py-[6px] gap-2 normal-case">
                                <Link href="/dashboard/settings" className="flex items-center gap-2">
                                    <Settings className="size-5" />
                                    <div className="body">settings</div>
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
