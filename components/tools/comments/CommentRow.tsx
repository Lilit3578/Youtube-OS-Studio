"use client";

import React from "react";
import { Comment } from "@/types/comments";
import { ThumbsUp, MoreVertical, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Using Intl.NumberFormat directly in the component for compact notation

interface CommentRowProps {
    comment: Comment;
}

export default function CommentRow({ comment }: CommentRowProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(comment.text);
    };

    return (
        <div className="flex items-start justify-between py-6 border-b border-neutral-100 last:border-0 group">
            <div className="flex-1 pr-8">
                <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap font-[var(--font-be-vietnam-pro)]">
                    {comment.text}
                </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-2 text-neutral-400">
                    <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-xs font-medium min-w-[30px]">
                        {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(comment.likeCount)}
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy text</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
