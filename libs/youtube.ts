import { Comment, CommentIntent } from "@/types/comments";
import logger from "./logger";

/** Shape of a single item from the YouTube commentThreads API */
interface YouTubeCommentItem {
    id: string;
    snippet: {
        totalReplyCount: number;
        topLevelComment: {
            snippet: {
                textDisplay: string;
                authorDisplayName: string;
                authorProfileImageUrl: string;
                likeCount: number;
                publishedAt: string;
            };
        };
    };
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
 */
export const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

/**
 * Classify comment intent using heuristic analysis
 */
const classifyIntent = (text: string): CommentIntent => {
    const lowerText = text.toLowerCase();

    // Questions - check for question marks and interrogative words
    if (
        lowerText.includes("?") ||
        /^(how|why|what|when|where|who|can you|could you|would you)\b/.test(lowerText)
    ) {
        return "question";
    }

    // Requests - check for polite requests and video suggestions
    if (
        lowerText.includes("please") ||
        /make a video|do a video|could you|would you/.test(lowerText)
    ) {
        return "request";
    }

    // Feedback - positive reactions and comparisons
    if (
        /\b(vs|versus|better than|difference between|love|great|amazing|awesome|good|thanks|thank you)\b/.test(lowerText)
    ) {
        return "feedback";
    }

    return "other";
};

/**
 * Fetch comments from YouTube Data API v3
 * Requires YOUTUBE_API_KEY environment variable
 */
export const fetchComments = async (videoId: string): Promise<Comment[]> => {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "YOUTUBE_API_KEY environment variable is not configured. " +
            "Please add it to your .env.local file."
        );
    }

    const params = new URLSearchParams({
        part: "snippet",
        videoId,
        maxResults: "100",
        textFormat: "plainText",
        order: "relevance",
        key: apiKey,
    });

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/commentThreads?${params}`,
            { next: { revalidate: 0 } } // No caching — always fresh
        );

        if (!res.ok) {
            if (res.status === 403) {
                throw new Error("YouTube API quota exceeded or API key invalid");
            }
            if (res.status === 404) {
                throw new Error("Video not found or comments are disabled");
            }
            throw new Error(`YouTube API error: ${res.status}`);
        }

        const json = await res.json() as { items?: YouTubeCommentItem[] };
        const items: YouTubeCommentItem[] = json.items || [];

        const comments: Comment[] = items
            .map((item) => {
                const snippet = item?.snippet?.topLevelComment?.snippet;
                if (!snippet) return null;

                const text = snippet.textDisplay;
                const totalReplyCount = item.snippet?.totalReplyCount || 0;

                // Filter emoji-only comments
                // Remove emojis, symbols, punctuation, and whitespace
                const stripped = text.replace(/[\p{Emoji_Presentation}\p{Symbol}\p{Punctuation}\s]/gu, "");

                // Skip if only emojis/symbols remain
                if (stripped.length === 0 && text.length > 0) {
                    return null;
                }

                return {
                    id: item.id,
                    text: text,
                    authorName: snippet.authorDisplayName,
                    authorProfileImageUrl: snippet.authorProfileImageUrl,
                    likeCount: snippet.likeCount,
                    replyCount: totalReplyCount,
                    publishedAt: snippet.publishedAt,
                    intent: classifyIntent(text),
                };
            })
            .filter((c: Comment | null): c is Comment => c !== null);

        return comments;
    } catch (error: unknown) {
        const err = error as { message?: string };
        // Re-throw known errors (quota, not found) without extra logging
        if (
            err?.message?.includes("YouTube API quota exceeded") ||
            err?.message?.includes("Video not found") ||
            err?.message?.includes("YOUTUBE_API_KEY")
        ) {
            throw error;
        }

        logger.error({ err: error }, "Error fetching YouTube comments");
        throw error;
    }
};
