"use client";

import React from "react";
import { Comment } from "@/types/comments";
import CommentRow from "./CommentRow";

interface CommentsListProps {
    comments: Comment[];
    loading: boolean;
    hasSearched: boolean;
}

export default function CommentsList({ comments, loading, hasSearched }: CommentsListProps) {
    if (loading) {
        return (
            <div className="py-12 text-center text-ink-700 body animate-pulse">
                Fetching comments from YouTube...
            </div>
        );
    }

    if (comments.length === 0 && hasSearched) {
        return (
            <div className="py-12 text-center text-ink-700 body">
                No comments found matching the criteria.
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
            ))}
        </div>
    );
}
