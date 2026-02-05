"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserPopoverProps {
    email: string;
    name: string;
}

export default function UserPopover({ email, name }: UserPopoverProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <PopoverContent
            className="bg-popover rounded-2xl shadow-lg border border-border p-4 min-w-[240px]"
            align="start"
            side="right"
            sideOffset={12}
        >
            {/* User Info */}
            <div className="mb-2 px-1">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
            </div>

            <Separator className="my-3 opacity-50" />

            <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 px-2"
            >
                <LogOut className="w-4 h-4" />
                <span className="body">logout</span>
            </Button>
        </PopoverContent>
    );
}
