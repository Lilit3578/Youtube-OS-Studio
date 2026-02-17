// libs/constants/messages.ts
// Centralized error messages from PRD for consistency

export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_EMAIL: "Please enter a valid email address.",
        EXPIRED_LINK:
            "This sign-in link has expired or already been used. Please request a new one.",
        OAUTH_CANCELLED: "Sign-in was cancelled.",
        OAUTH_FAILED: "Google sign-in failed. Please try again.",
        EMAIL_SEND_FAILED:
            "We couldn't send the sign-in email. Please try again later.",
        GENERIC_SIGNIN: "Unable to sign in. Please try again.",
        SIGNIN_FAILED: "Sign-in failed. Please try again.",
        RATE_LIMIT: "Too many sign-in attempts. Please try again in a few minutes.",
        LOGIN_REQUIRED: "Please sign in to continue.",
        PLAN_REQUIRED: "Pick a plan to use this feature.",
    },
    GLOBAL: {
        GENERIC: "Something went wrong. Please try again.",
        DAILY_LIMIT: "Daily usage limit reached. Please try again tomorrow.",
        NETWORK_ERROR:
            "Network error. Please check your connection and try again.",
        SESSION_ENDED:
            "Your session has ended. Please refresh the page and sign in again.",
        CONNECTION_LOST:
            "Connection lost. Please check your internet connection and try again.",
        TAB_CONFLICT:
            "This session is open in another tab. Please continue in one tab to avoid conflicts.",
        ACTION_INTERRUPTED:
            "Your action was interrupted by a page refresh. Please try again.",
        CLIPBOARD_FAILED: "Failed to copy to clipboard.",
        ERROR_BOUNDARY:
            "An unexpected error occurred. Please try again or contact support.",
    },
    ACCOUNT: {
        DELETE_FAILED: "Failed to delete account.",
    },
    FORM: {
        REQUIRED_FIELDS: "Please fill in all required fields.",
    },
    TOOLS: {
        REGISTER_FAILED: "Failed to register interest.",
        QR: {
            EMPTY: "Paste a URL to generate a QR code",
            INVALID_URL: "Please enter a valid URL",
            LOGO_ERROR: "Logo could not be applied",
            LOGO_UNSUPPORTED:
                "Unsupported logo file. Please upload a PNG or JPG under 1 MB.",
            DOWNLOAD_BLOCKED:
                "Download blocked by your browser. Please allow downloads or use the manual download button.",
        },
        THUMBNAIL: {
            EMPTY: "Upload an image to optimise it for YouTube thumbnails",
            UNSUPPORTED_FORMAT:
                "unsupported file format, only jpg and png images are supported",
            TOO_LARGE: "image size too large, try uploading a smaller image",
            COMPRESSION_LIMIT:
                "unable to compress image below 2mb without significant quality loss",
            BROWSER_LIMIT:
                "image processing failed due to browser limitations, try a smaller image or refresh the page",
            GENERIC_FAIL: "image compression failed, please try again",
            ZIP_FAILED: "Failed to create zip file.",
        },
        METADATA: {
            EMPTY: "Paste a YouTube video URL to inspect its metadata.",
            INVALID_URL: "Please enter a valid YouTube video URL.",
            UNAVAILABLE: "This video is unavailable, private, or restricted.",
            QUOTA_EXCEEDED: "YouTube data limit reached. Please try again later.",
            GENERIC_FAIL: "Unable to fetch video data. Please try again later.",
            NO_TAGS: "Tags are not publicly accessible for this video.",
        },
        COMMENTS: {
            NO_PUBLIC: "This video has no public comments.",
            NO_IN_CATEGORY: "No comments found in this category.",
            DISABLED: "Comments are disabled for this video.",
            INVALID_URL: "Please enter a valid YouTube video URL.",
            QUOTA_EXCEEDED: "YouTube data limit reached. Please try again later.",
            EXPORT_FAIL:
                "Unable to generate the export file. Please try downloading again.",
            GENERIC_FAIL: "Unable to fetch comments at this time.",
        },
    },
} as const;

export const SUCCESS_MESSAGES = {
    ACCOUNT: {
        SAVED: "Profile saved",
        DELETED: "Account deleted",
    },
    CLIPBOARD: {
        COMMENT_COPIED: "Comment copied to clipboard",
    },
    DOWNLOAD: {
        ALL_IMAGES: "All images downloaded!",
    },
    TOOLS: {
        REQUEST_SUBMITTED: "Request submitted successfully!",
        INTEREST_REGISTERED: "You're on the list!",
    },
} as const;

export type ErrorMessages = typeof ERROR_MESSAGES;
export type SuccessMessages = typeof SUCCESS_MESSAGES;
