"use client";

import { X } from "lucide-react";
import { helpContent } from "@/config/help-content";
import { useEffect } from "react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    toolId: string;
}

export default function HelpModal({ isOpen, onClose, toolId }: HelpModalProps) {
    const content = helpContent[toolId];

    // Close on Escape key and manage body scroll
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !content) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Card - matches Figma structure */}
            <div
                className="bg-[#FEFEFE] rounded-xl border-b border-[rgba(20,20,20,0.04)] inline-flex flex-col items-start justify-start w-full max-w-[528px] mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Title and Close Button */}
                <div className="self-stretch px-6 py-4 border-b border-[rgba(20,20,20,0.04)] inline-flex justify-center items-center gap-2.5">
                    <h2 className="flex-1 text-[#141414] text-xl font-[var(--font-instrument-serif)] italic font-normal leading-7">
                        {content.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex justify-center items-center gap-2.5"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4 text-[rgba(20,20,20,0.40)]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="self-stretch p-8 flex flex-col justify-center items-center gap-8">
                    {/* Text Content */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <h3 className="self-stretch text-[#141414] text-sm font-[var(--font-be-vietnam-pro)] font-medium leading-[23.8px]">
                            how does it work?
                        </h3>
                        <p className="self-stretch text-[rgba(20,20,20,0.64)] text-sm font-[var(--font-be-vietnam-pro)] font-normal leading-[23.8px]">
                            {content.description}
                        </p>
                    </div>

                    {/* Video Embed Area */}
                    <div className="w-[480px] h-[270px] bg-[rgba(20,20,20,0.04)] rounded-[10px] border border-[rgba(20,20,20,0.08)] flex items-center justify-center overflow-hidden">
                        {content.videoUrl ? (
                            <iframe
                                src={content.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`${content.title} tutorial video`}
                            />
                        ) : (
                            <span className="text-[rgba(20,20,20,0.40)] text-sm font-[var(--font-be-vietnam-pro)]">
                                Video tutorial coming soon
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer with Button */}
                <div className="self-stretch px-6 py-4 border-t border-[rgba(20,20,20,0.04)] flex flex-col justify-center items-end gap-2.5">
                    <button
                        onClick={onClose}
                        className="h-10 px-6 py-3 bg-[#141414] rounded-full inline-flex justify-center items-center gap-2 hover:bg-[rgba(20,20,20,0.90)] transition-colors"
                    >
                        <span className="text-[#FEFEFE] text-xs font-['JetBrains_Mono'] font-medium uppercase leading-[15.6px]">
                            Got it
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
