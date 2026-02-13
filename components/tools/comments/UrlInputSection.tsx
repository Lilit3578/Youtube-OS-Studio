"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface UrlInputSectionProps {
    url: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function UrlInputSection({ url, onChange, disabled }: UrlInputSectionProps) {
    return (
        <div className="flex flex-col gap-[10px]">
            <p className="body-strong text-ink-1000">
                youtube url
            </p>
            <Input
                id="youtube-url"
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-ink-0 border-ink-300 focus:ring-1 focus:ring-system-primary body px-4 py-2 rounded-lg"
            />
        </div>
    );
}
