"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import ExcelJS from "exceljs";

import UrlInputSection from "@/components/tools/comments/UrlInputSection";
import CommentsHeader from "@/components/tools/comments/CommentsHeader";
import FilterTabs, { FilterType } from "@/components/tools/comments/FilterTabs";
import CommentsList from "@/components/tools/comments/CommentsList";
import InlineError from "@/components/tools/comments/InlineError";
import { ERROR_MESSAGES } from "@/libs/constants/messages";
import { Comment, CommentResponse } from "@/types/comments";

/** Extract a YouTube video ID (exactly 11 chars) from various URL formats. */
const extractVideoIdClient = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

/** Sanitize text for CSV/Excel formula injection. */
const sanitizeForExport = (text: string): string => {
    if (typeof text !== "string") return text;
    // Remove control characters that can break CSV cell boundaries
    let cleaned = text.replace(/[\r\n\t]/g, " ");
    // Prefix dangerous leading characters
    const unsafeChars = ["=", "+", "-", "@", "|", "\\"];
    if (unsafeChars.some((char) => cleaned.startsWith(char))) {
        cleaned = "'" + cleaned;
    }
    return cleaned;
};

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

    // Track last-fetched video ID to prevent duplicate requests
    const lastFetchedVideoId = useRef<string | null>(null);
    const loadingRef = useRef(false);

    const handleFetch = useCallback(async (inputUrl: string) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
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
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError("Received invalid response from server");
            } else if (err instanceof TypeError) {
                // Network errors often appear as TypeErrors in fetch
                setError(ERROR_MESSAGES.GLOBAL.NETWORK_ERROR);
            } else {
                setError(ERROR_MESSAGES.TOOLS.COMMENTS.GENERIC_FAIL);
            }
        } finally {
            // Always reset loading state
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // Auto-fetch only when a complete, valid 11-char video ID is detected
    useEffect(() => {
        const videoId = extractVideoIdClient(url);
        if (!videoId || videoId === lastFetchedVideoId.current) return;

        const timer = setTimeout(() => {
            lastFetchedVideoId.current = videoId;
            handleFetch(url);
        }, 800);

        return () => clearTimeout(timer);
    }, [url, handleFetch]);

    const filteredComments = useMemo(() => {
        if (filter === "all") return comments;
        return comments.filter((c) => c.intent === filter);
    }, [comments, filter]);

    const handleCopyAll = async () => {
        if (filteredComments.length === 0) return;
        const textToCopy = filteredComments.map(c => `- ${c.text}`).join("\n");
        try {
            await navigator.clipboard.writeText(textToCopy);
            toast.success(`Copied ${filteredComments.length} comments to clipboard`);
        } catch {
            toast.error(ERROR_MESSAGES.GLOBAL.CLIPBOARD_FAILED);
        }
    };

    const handleDownload = async (format: "csv" | "excel") => {
        // Export the currently-filtered view (WYSIWYG) rather than all comments.
        // If the user is on the "questions" tab, they get only questions exported.
        if (filteredComments.length === 0) return;

        const dataToExport = filteredComments.map((c, index) => ({
            Line: index + 1,
            Date: sanitizeForExport(c.publishedAt),
            Likes: c.likeCount,
            Replies: c.replyCount,
            Intent: sanitizeForExport(c.intent),
            Comment: sanitizeForExport(c.text),
        }));

        if (format === "csv") {
            // Native CSV generation — no library needed
            const headers = ["Line", "Date", "Likes", "Replies", "Intent", "Comment"];
            const rows = dataToExport.map(row =>
                headers.map(h => {
                    const val = String((row as Record<string, unknown>)[h] ?? "");
                    // Wrap in quotes if it contains commas, quotes, or newlines
                    return val.includes(",") || val.includes('"') || val.includes("\n")
                        ? `"${val.replace(/"/g, '""')}"`
                        : val;
                }).join(",")
            );
            const csvOutput = [headers.join(","), ...rows].join("\n");

            const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", blobUrl);
            link.setAttribute("download", "youtube_comments.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } else {
            // Excel export via exceljs
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Comments");

            worksheet.columns = [
                { header: "Line", key: "Line", width: 8 },
                { header: "Date", key: "Date", width: 22 },
                { header: "Likes", key: "Likes", width: 8 },
                { header: "Replies", key: "Replies", width: 10 },
                { header: "Intent", key: "Intent", width: 12 },
                { header: "Comment", key: "Comment", width: 80 },
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.addRows(dataToExport);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "youtube_comments.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const mappedCounts = {
        total: counts.total,
        question: counts.question,
        request: counts.request,
        feedback: counts.feedback,
        other: counts.other
    };

    return (
        <div className="w-full">
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
                hasError={!!error}
            />

            {/* Branding Compliance */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 caption text-ink-700">
                    <span>Data provided by YouTube</span>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 opacity-70"
                        aria-label="YouTube logo"
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
