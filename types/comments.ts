export type CommentIntent = "question" | "request" | "feedback" | "other";

export interface Comment {
    id: string;
    text: string;
    authorName: string;
    authorProfileImageUrl: string;
    likeCount: number;
    replyCount: number;
    publishedAt: string;
    intent: CommentIntent;
}

export interface CommentResponse {
    videoId: string;
    comments: Comment[];
    counts: {
        total: number;
        questions: number;
        requests: number;
        feedback: number;
        other: number;
    };
}
