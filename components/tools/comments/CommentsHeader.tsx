"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, FileSpreadsheet } from "lucide-react";

interface CommentsHeaderProps {
    onDownloadConfig: (format: "csv" | "excel") => void;
    hasComments: boolean;
}

export default function CommentsHeader({ onDownloadConfig, hasComments }: CommentsHeaderProps) {
    return (
        <>
            <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="h2-italic text-ink-1000">
                    comments
                </h2>

                {hasComments && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="default" className="label cursor-pointer bg-ink-1000 text-ink-0 px-6 py-3 rounded-full h-10">
                                DOWNLOAD
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            className="w-[180px] p-2 bg-ink-0 rounded-xl shadow-lg border border-ink-300"
                        >
                            <div className="flex flex-col gap-1">
                                {/* CSV */}
                                <Button
                                    variant="ghost"
                                    onClick={() => onDownloadConfig("csv")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-ink-200 cursor-pointer"
                                >
                                    <span className="body text-ink-1000">
                                        csv
                                    </span>
                                    <FileText className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </Button>

                                {/* Excel */}
                                <Button
                                    variant="ghost"
                                    onClick={() => onDownloadConfig("excel")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-ink-200 cursor-pointer"
                                >
                                    <span className="body text-ink-1000">
                                        excel
                                    </span>
                                    <FileSpreadsheet className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <Separator className="bg-ink-200 opacity-50 mb-4" />
        </>
    );
}
