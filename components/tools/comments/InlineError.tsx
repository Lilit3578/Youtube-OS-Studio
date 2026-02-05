"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/libs/utils";

interface InlineErrorProps {
    message: string;
    className?: string;
}

export default function InlineError({ message, className }: InlineErrorProps) {
    if (!message) return null;

    return (
        <div className={cn(
            "flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-1 duration-200",
            className
        )}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="body font-medium leading-relaxed">
                {message}
            </p>
        </div>
    );
}
