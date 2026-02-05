"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserPopoverProps {
    email: string;
    name: string;
    isOpen: boolean;
    onClose: () => void;
    position: { top: number; left: number };
}

export default function UserPopover({ email, name, isOpen, onClose }: UserPopoverProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <Popover open={isOpen} onOpenChange={onClose}>
            <PopoverTrigger asChild>
                <div />
            </PopoverTrigger>
            <PopoverContent
                className="bg-popover rounded-lg shadow-lg border border-border p-4 min-w-[240px]"
                align="start"
                side="top"
                sideOffset={8}
            >
                {/* User Info */}
                <div className="mb-3">
                    <p className="text-sm font-medium text-popover-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
                </div>

                <Separator className="my-3" />

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </Button>
            </PopoverContent>
        </Popover>
    );
}
