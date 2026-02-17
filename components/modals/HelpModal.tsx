"use client";

import { helpContent } from "@/config/help-content";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

    // Helper to extract tool name properly if needed, although helpContent key is good enough
    // But for the title "extract comments" style, let's trust the config for now.

    if (!content) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 
              p-0 to remove default padding
              gap-0 to remove default gap
              max-w-[580px] to give enough room for 480px video + padding
            */}
            <DialogContent className="bg-card p-0 gap-0 w-full max-w-[580px] rounded-xl border border-border sm:rounded-xl">
                {/* Header with Title */}
                <DialogHeader className="px-6 py-4 border-b border-border text-left">
                    <DialogTitle className="text-foreground text-[20px] font-serif font-normal leading-[140%] text-left">
                        {content.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {content.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-center items-center gap-6">
                    {/* Text Content */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                        <h3 className="self-stretch text-foreground text-[16px] font-medium leading-[24px]">
                            how does it work?
                        </h3>
                        <p className="w-full text-[14px] leading-[20px] text-muted-foreground">
                            {content.description}
                        </p>
                    </div>

                    {/* Video Embed Area */}
                    <div className="w-[480px] h-[270px] bg-muted/50 rounded-lg border border-border flex items-center justify-center overflow-hidden relative">
                        {(() => {
                            const embedUrl = content.videoUrl
                                ? (() => {
                                    // eslint-disable-next-line no-useless-escape
                                    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
                                    const match = content.videoUrl.match(regex);
                                    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
                                })()
                                : null;

                            return embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full"
                                    sandbox="allow-scripts allow-same-origin allow-presentation"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={`${content.title} tutorial video`}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                                    <span className="text-[14px] text-muted-foreground font-medium">
                                        Video tutorial coming soon
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Footer with Button */}
                <DialogFooter className="px-6 py-4 border-t border-border flex sm:justify-end">
                    <Button
                        variant="default" // Typically black/primary in this design system
                        onClick={onClose}
                        className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
