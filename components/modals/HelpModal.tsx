"use client";

import { X } from "lucide-react";
import { helpContent } from "@/config/help-content";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    toolId: string;
}

export default function HelpModal({ isOpen, onClose, toolId }: HelpModalProps) {
    const content = helpContent[toolId];

    if (!content) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card rounded-xl border-b border-ink-200 w-full max-w-[528px]">
                {/* Header with Title and Close Button */}
                <DialogHeader className="px-6 py-4 border-b border-ink-200">
                    <DialogTitle className="text-foreground text-[20px] font-serif font-normal leading-[28px]">
                        {content.title}
                    </DialogTitle>
                </DialogHeader>

                {/* Content Section */}
                <div className="p-8 flex flex-col justify-center items-center gap-8">
                    {/* Text Content */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <h3 className="self-stretch text-foreground p-medium">
                            how does it work?
                        </h3>
                        <p className="body self-stretch text-ink-800">
                            {content.description}
                        </p>
                    </div>

                    {/* Video Embed Area */}
                    <div className="w-[480px] h-[270px] bg-ink-200 rounded-[10px] border border-ink-300 flex items-center justify-center overflow-hidden">
                        {content.videoUrl ? (
                            <iframe
                                src={content.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`${content.title} tutorial video`}
                            />
                        ) : (
                            <span className="body text-ink-700">
                                Video tutorial coming soon
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer with Button */}
                <DialogFooter className="px-6 py-4 border-t border-ink-200">
                    <Button
                        onClick={onClose}
                        className="h-10 px-6 py-3 bg-foreground rounded-full hover:bg-ink-900"
                    >
                        <span className="text-background caption">
                            Got it
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
