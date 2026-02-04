"use client";

import React from "react";
import { Comment } from "@/types/comments";
import { ThumbsUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
// Using Intl.NumberFormat directly in the component for compact notation

interface CommentRowProps {
    comment: Comment;
}

export default function CommentRow({ comment }: CommentRowProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(comment.text);
        toast.success("Comment copied to clipboard");
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
                    <span className="text-xs font-medium min-w-[20px]">
                        {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(comment.likeCount)}
                    </span>
                </div>

                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 text-neutral-300 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
