/* eslint-disable @next/next/no-img-element */
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const ButtonAccount = () => {
	const { data: session, status } = useSession();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	const handleSignOut = () => {
		signOut({ callbackUrl: "/" });
	};

	if (status === "unauthenticated") return null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<SidebarMenuButton className="normal-case h-9 px-2.5 py-1.5 cursor-pointer group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center">
					{session?.user?.image ? (
						<img
							src={session?.user?.image}
							alt={session?.user?.name || "Account"}
							className="h-4 w-4 rounded-full shrink-0"
							referrerPolicy="no-referrer"
						/>
					) : (
						<div className="h-5 w-5 rounded-full bg-ink-1000 flex items-center justify-center shrink-0">
							<span className="label text-ink-0">
								{session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
							</span>
						</div>
					)}
					{!isCollapsed && (
						<div className="flex flex-col items-start overflow-hidden">
							<span className="body font-medium text-foreground truncate w-full">
								{session?.user?.name || "Account"}
							</span>
						</div>
					)}
				</SidebarMenuButton>
			</PopoverTrigger>
			<PopoverContent
				className="bg-popover rounded-2xl shadow-lg border border-border p-4 min-w-[240px]"
				align="start"
				side="right"
				sideOffset={12}
			>
				{/* User Info */}
				<div className="mb-2 px-1">
					<p className="text-sm font-medium text-foreground">
						{session?.user?.name || "Account"}
					</p>
					{session?.user?.email && (
						<p className="text-xs text-muted-foreground mt-0.5">
							{session.user.email}
						</p>
					)}
				</div>

				<Separator className="my-3 opacity-50" />

				<Button
					variant="ghost"
					onClick={handleSignOut}
					className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 px-2 cursor-pointer"
				>
					<LogOut className="w-4 h-4" />
					<span className="body">logout</span>
				</Button>
			</PopoverContent>
		</Popover>
	);
};

export default ButtonAccount;
