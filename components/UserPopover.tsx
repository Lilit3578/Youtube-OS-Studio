"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useEffect, useRef } from "react";

interface UserPopoverProps {
    email: string;
    name: string;
    isOpen: boolean;
    onClose: () => void;
    position: { top: number; left: number };
}

export default function UserPopover({ email, name, isOpen, onClose, position }: UserPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div
            ref={popoverRef}
            className="absolute z-50 bg-white rounded-lg shadow-lg border border-neutral-200 p-4 min-w-[240px]"
            style={{
                bottom: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {/* User Info */}
            <div className="mb-3">
                <p className="text-sm font-medium text-neutral-900">{name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{email}</p>
            </div>

            <div className="border-t border-neutral-200 pt-3">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
