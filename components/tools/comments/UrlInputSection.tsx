"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface UrlInputSectionProps {
    url: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function UrlInputSection({ url, onChange, disabled }: UrlInputSectionProps) {
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="youtube-url" className="text-sm font-medium text-neutral-900">
                youtube url
            </Label>
            <Input
                id="youtube-url"
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-white border-neutral-200 focus:ring-1 focus:ring-black"
            />
            <Separator className="bg-neutral-200/50" />
        </div>
    );
}
