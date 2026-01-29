import axios from "axios";
import { Comment, CommentIntent } from "@/types/comments";

const YOUTUBE_API_KEY = process.env.GOOGLE_ID; // Using GOOGLE_ID as placeholder or we might need a specific API key if not using OAuth token. 
// Wait, the instructions say "YouTube Data API v3". Usually requires an API Key. 
// The environment variables list `GOOGLE_ID` and `GOOGLE_SECRET` which are likely for OAuth.
// For public data like comments, an API Key is sufficient. 
// However, typically in these boilerpates `GOOGLE_ID` is the Client ID. 
// I should check if there is a separate `YOUTUBE_API_KEY` or if I should use the one from `process.env`.
// Checking `ANTIGRAVITY_INSTRUCTIONS.md` or `config.ts` might help, but standard is usually a specific key.
// User context didn't provide a specific YOUTUBE_API_KEY. I will assume for now I might need to use `process.env.YOUTUBE_API_KEY` if it exists, or typically `NEXT_PUBLIC_...` if client side, but this is server side.
// Let's assume there is a `YOUTUBE_API_KEY` env var. If not, I might need to ask or use a placeholder.
// Actually, for `commentThreads.list`, if I use OAuth token from the session, I can access it.
// The requirements say "API: YouTube Data API v3 (commentThreads.list)".
// And "Authentication: Require a signed-in session using auth()."
// I can potentially use the user's access token if the scope is requested.
// BUT, the `next-auth.ts` config only shows `GoogleProvider` with default scopes usually (profile, email).
// To fetch public comments, a simple API Key is easier and doesn't require user permissions.
// Let's check `.env.local` or similar if I could. But I can't read .env files directly usually.
// I'll proceed with `process.env.YOUTUBE_API_KEY` and fallback to trying to find it. 
// actually, let's look at `libs/next-auth.ts` again. It has `GOOGLE_ID`.
// The user prompt said "Limits: 20 requests per day per user". This implies backend proxying.
// I will use `process.env.YOUTUBE_API_KEY`.

export const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Heuristic-based classification
const classifyIntent = (text: string): CommentIntent => {
    const lowerText = text.toLowerCase();

    // Questions
    if (
        lowerText.includes("?") ||
        lowerText.startsWith("how") ||
        lowerText.startsWith("why") ||
        lowerText.startsWith("what") ||
        lowerText.includes("can you")
    ) {
        return "question";
    }

    // Requests
    if (
        lowerText.includes("please") ||
        lowerText.includes("make a video") ||
        lowerText.includes("do a video") ||
        lowerText.includes("could you")
    ) {
        return "request";
    }

    // Feedback (Positive/Reaction)
    if (
        lowerText.includes("vs") ||
        lowerText.includes("better than") ||
        lowerText.includes("difference between") ||
        lowerText.includes("love") ||
        lowerText.includes("great") ||
        lowerText.includes("amazing") ||
        lowerText.includes("good") ||
        lowerText.includes("thanks") ||
        lowerText.includes("thank you")
    ) {
        return "feedback";
    }

    return "other";
};

export const fetchComments = async (videoId: string): Promise<Comment[]> => {
    try {
        // Note: In a real app, you'd make sure YOUTUBE_API_KEY is available.
        // If using OAuth, you'd pass the access token. 
        // Here we assume server-side API key for public data access.
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            console.warn("YOUTUBE_API_KEY is not set. Comments fetching will fail.");
            throw new Error("Server configuration error: API Key missing");
        }

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            {
                params: {
                    part: "snippet",
                    videoId: videoId,
                    maxResults: 100,
                    textFormat: "plainText",
                    order: "relevance",
                    key: apiKey,
                },
            }
        );

        const items = response.data.items || [];

        const comments: Comment[] = items
            .map((item: any) => {
                const snippet = item.snippet.topLevelComment.snippet;
                const text = snippet.textDisplay;
                const totalReplyCount = item.snippet.totalReplyCount || 0;

                // Emoji filtering: Remove comments that are ONLY emojis/symbols/whitespace
                // We use a more specific regex to avoid matching numbers/punctuation as "emojis"
                // The previous \p{Emoji} matches numbers 0-9 which is not desired.
                // We'll strip all emojis, symbols, and whitespace. If nothing remains, it's emoji-only.
                const stripped = text.replace(/[\p{Emoji_Presentation}\p{Symbol}\p{Punctuation}\s]/gu, "");
                const isOnlyEmojis = stripped.length === 0;

                if (isOnlyEmojis && text.length > 0) return null;

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
            .filter((c: Comment | null) => c !== null); // Filter out nulls (emoji-only comments)

        return comments;
    } catch (error) {
        console.error("Error fetching YouTube comments:", error);
        throw error;
    }
};
