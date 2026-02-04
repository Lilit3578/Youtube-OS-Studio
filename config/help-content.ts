export interface ToolHelpContent {
    title: string;
    description: string;
    videoUrl?: string;
}

export const helpContent: Record<string, ToolHelpContent> = {
    metadata: {
        title: "analyze video data",
        description: "Enter a YouTube URL to inspect video tags and hidden metadata. Discover what makes videos rank higher in search results and analyze your competition's optimization strategies.",
        videoUrl: "" // Add YouTube embed URL when available
    },
    comments: {
        title: "extract comments",
        description: "Enter a YouTube URL to extract the TOP 100 comments based on relevance. You can export results as CSV or XLSX!",
        videoUrl: ""
    },
    thumbnail: {
        title: "compress thumbnail",
        description: "Upload your thumbnail image to resize and compress it to YouTube's recommended standards. Download optimized versions instantly for better performance.",
        videoUrl: ""
    },
    qr: {
        title: "generate qr code",
        description: "Create custom branded QR codes for your content. Perfect for linking to your videos, channel, or social media profiles. Download in multiple formats.",
        videoUrl: ""
    }
};
