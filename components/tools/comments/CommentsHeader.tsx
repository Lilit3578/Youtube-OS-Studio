"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, FileSpreadsheet } from "lucide-react"; // Using FileSpreadsheet for Excel/CSV approximation or similar
// Actually, Lucide has 'FileCsv' maybe? Or just FileText for CSV and FileSpreadsheet for Excel.
// Let's check available icons. Lucide icons are standard.
// Using FileText for CSV and FileSpreadsheet (or similar like Sheet) for Excel.
// Assuming FileSpreadsheet exists, otherwise FileText for both.
import { cn } from "@/libs/utils";

interface CommentsHeaderProps {
    onDownloadConfig: (format: "csv" | "excel") => void;
    hasComments: boolean;
}

export default function CommentsHeader({ onDownloadConfig, hasComments }: CommentsHeaderProps) {
    return (
        <div className="grid items-center mt-8 mb-4 gap-4">
            <div className="flex items-center items-center justify-between">
                <h2 className="text-[32px] leading-[36px] font-serif font-normal text-foreground">
                    comments
                </h2>

                {hasComments && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="default" className="normal-case">
                                download
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            className="w-[180px] p-2 bg-popover rounded-xl shadow-lg border border-ink-200"
                        >
                            <div className="flex flex-col gap-1">
                                {/* CSV */}
                                <Button
                                    variant="ghost"
                                    onClick={() => onDownloadConfig("csv")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto"
                                >
                                    <span className="body text-foreground">
                                        csv
                                    </span>
                                    <FileText className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                                </Button>

                                {/* Excel */}
                                <Button
                                    variant="ghost"
                                    onClick={() => onDownloadConfig("excel")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-black/5"
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
            <Separator className="bg-border opacity-50" />
        </div>
    );
}
