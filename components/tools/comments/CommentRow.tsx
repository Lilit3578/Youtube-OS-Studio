"use client";

import React from "react";
import { Comment } from "@/types/comments";
import { ThumbsUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/libs/constants/messages";
const compactFormatter = new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 });

interface CommentRowProps {
    comment: Comment;
}

export default function CommentRow({ comment }: CommentRowProps) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(comment.text);
            toast.success(SUCCESS_MESSAGES.CLIPBOARD.COMMENT_COPIED);
        } catch {
            toast.error(ERROR_MESSAGES.GLOBAL.CLIPBOARD_FAILED);
        }
    };

    return (
        <div className="flex items-start justify-between py-6 border-b border-ink-200 last:border-0 group">
            <p className="flex-1 pr-8 body text-ink-1000 leading-relaxed whitespace-pre-wrap">
                {comment.text}
            </p>

            <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-2 text-ink-700">
                    <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
                    <span className="caption min-w-[20px] text-ink-700">
                        {compactFormatter.format(comment.likeCount)}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    aria-label="Copy comment"
                    className="h-8 w-8 text-ink-500 hover:text-ink-1000 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
