/* eslint-disable @next/next/no-img-element */
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

// A button to show user account actions
// - Logout: sign out and go back to homepage
const ButtonAccount = () => {
	const { data: session, status } = useSession();

	const handleSignOut = () => {
		signOut({ callbackUrl: "/" });
	};

	// Don't show anything if not authenticated (we don't have any info about the user)
	if (status === "unauthenticated") return null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="gap-2">
					{session?.user?.image ? (
						<img
							src={session?.user?.image}
							alt={session?.user?.name || "Account"}
							className="w-6 h-6 rounded-full shrink-0"
							referrerPolicy="no-referrer"
							width={24}
							height={24}
						/>
					) : (
						<span className="w-6 h-6 bg-slate-100 flex justify-center items-center rounded-full shrink-0">
							{session?.user?.name?.charAt(0) ||
								session?.user?.email?.charAt(0)}
						</span>
					)}

					{session?.user?.name || "Account"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-60 p-2" align="end">
				<div className="space-y-1">
					<Button
						variant="ghost"
						className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-500 h-auto py-2"
						onClick={handleSignOut}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-5 h-5"
						>
							<path
								fillRule="evenodd"
								d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
								clipRule="evenodd"
							/>
							<path
								fillRule="evenodd"
								d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
								clipRule="evenodd"
							/>
						</svg>
						Logout
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ButtonAccount;
