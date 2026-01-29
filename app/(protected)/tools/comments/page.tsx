"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

import UrlInputSection from "@/components/tools/comments/UrlInputSection";
import CommentsHeader from "@/components/tools/comments/CommentsHeader";
import FilterTabs, { FilterType } from "@/components/tools/comments/FilterTabs";
import CommentsList from "@/components/tools/comments/CommentsList";
import InlineError from "@/components/tools/comments/InlineError";
import { ERROR_MESSAGES } from "@/libs/constants/messages";
import { Comment, CommentIntent, CommentResponse } from "@/types/comments";
import { extractVideoId } from "@/libs/youtube"; // Using client-side safe export if possible, otherwise duplicate logic. 
// Wait, libraries in `libs/` are usually shared. `axios` is in `libs/youtube.ts` so it might be Node.js only if it uses Node constructs, but `extractVideoId` is pure string manipulation.
// Re-checking libs/youtube.ts... it imports axios. Next.js might fuss if I import 'axios' in a client component if it's not careful, but usually it's fine. 
// However, `libs/youtube.ts` *also* has `fetchComments` which uses `process.env`. `process.env` on client is undefined for non-NEXT_PUBLIC.
// So I should NOT import `fetchComments` here. But `extractVideoId` is pure. 
// I'll copy `extractVideoId` logic or safe import if it was split. 
// To be safe and clean, I will just duplicate the regex or move it to a shared utils file. 
// For now, I'll just use a local regex to avoid importing server-side code into client bundle.

export default function CommentExplorerPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState({
        total: 0,
        question: 0,
        request: 0,
        feedback: 0,
        other: 0
    });

    // Debounce for auto-fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (url && extractVideoIdClient(url)) {
                handleFetch(url);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [url]);

    const extractVideoIdClient = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleFetch = async (inputUrl: string) => {
        // Avoid double fetching if loading
        if (loading) return;

        setLoading(true);
        setHasSearched(true);
        setError(null);
        setComments([]);
        setCounts({ total: 0, question: 0, request: 0, feedback: 0, other: 0 });

        try {
            const response = await fetch("/api/youtube/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: inputUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Map API errors to local ERROR_MESSAGES if possible, otherwise use data.error
                const errorMsg = data.errorKey && (ERROR_MESSAGES.TOOLS.COMMENTS as any)[data.errorKey]
                    ? (ERROR_MESSAGES.TOOLS.COMMENTS as any)[data.errorKey]
                    : data.error || ERROR_MESSAGES.TOOLS.COMMENTS.GENERIC_FAIL;

                setError(errorMsg);
                return;
            }

            const resTypes = data as CommentResponse;
            setComments(resTypes.comments);
            setCounts({
                total: resTypes.counts.total,
                question: resTypes.counts.questions,
                request: resTypes.counts.requests,
                feedback: resTypes.counts.feedback,
                other: resTypes.counts.other
            });

        } catch (err: any) {
            setError(ERROR_MESSAGES.GLOBAL.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const filteredComments = useMemo(() => {
        if (filter === "all") return comments;
        return comments.filter((c) => c.intent === filter);
    }, [comments, filter]);

    const handleCopyAll = () => {
        if (filteredComments.length === 0) return;
        const textToCopy = filteredComments.map(c => `- ${c.text}`).join("\n");
        navigator.clipboard.writeText(textToCopy);
        toast.success(`Copied ${filteredComments.length} comments to clipboard`);
    };

    const handleDownload = (format: "csv" | "excel") => {
        if (comments.length === 0) return;

        // Sanitize for formula injection
        const sanitize = (text: string) => {
            if (typeof text !== "string") return text;
            // If starts with =, +, -, @, prefix with '
            const unsafeChars = ["=", "+", "-", "@"];
            if (unsafeChars.some((char) => text.startsWith(char))) {
                return "'" + text;
            }
            return text;
        };

        const dataToExport = comments.map((c, index) => ({
            Line: index + 1,
            Date: c.publishedAt,
            Likes: c.likeCount,
            Replies: c.replyCount,
            Intent: c.intent,
            Comment: sanitize(c.text),
        }));

        if (format === "csv") {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

            const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "youtube_comments.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Comments");
            XLSX.writeFile(workbook, "youtube_comments.xlsx");
        }
    };

    // Mapping counts for FilterTabs which expects specific keys
    const mappedCounts = {
        total: counts.total,
        question: counts.question, // from api 'questions' mapped to state 'question' or fixing state naming
        request: counts.request, // api 'requests'
        feedback: counts.feedback, // api 'feedback'
        other: counts.other
    };

    // Fix: Types mismatch if I don't align them. 
    // API response: questions, requests. State: question, request. 
    // Let's adjust state or usage.
    // In `handleFetch`: `question: resTypes.counts.questions` (Correct)

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <UrlInputSection
                url={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
            />

            <CommentsHeader
                hasComments={comments.length > 0}
                onDownloadConfig={handleDownload}
            />

            {error && <InlineError message={error} className="mb-8" />}

            {comments.length > 0 && (
                <FilterTabs
                    currentFilter={filter}
                    onFilterChange={setFilter}
                    onCopyAll={handleCopyAll}
                    counts={mappedCounts}
                />
            )}

            <CommentsList
                comments={filteredComments}
                loading={loading}
                hasSearched={hasSearched}
            />

            {/* Branding Compliance */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
                    <span>Data provided by YouTube</span>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 opacity-70"
                    >
                        <path
                            d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
                            fill="#FF0000"
                        />
                        <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z" fill="#fff" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
