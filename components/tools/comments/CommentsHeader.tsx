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
                <h2 className="text-2xl font-[var(--font-instrument-serif)] italic text-neutral-900">
                    comments
                </h2>

                {hasComments && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-md px-6 py-2 h-auto text-sm font-medium transition-colors cursor-pointer">
                                DOWNLOAD
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            className="w-[180px] p-2 bg-white rounded-xl shadow-lg border border-black/5"
                        >
                            <div className="flex flex-col gap-1">
                                {/* CSV */}
                                <button
                                    type="button"
                                    onClick={() => onDownloadConfig("csv")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-black/5 transition-colors cursor-pointer"
                                >
                                    <span className="text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] leading-[23.8px]">
                                        csv
                                    </span>
                                    <FileText className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </button>

                                {/* Excel */}
                                <button
                                    type="button"
                                    onClick={() => onDownloadConfig("excel")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-black/5 transition-colors cursor-pointer"
                                >
                                    <span className="text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] leading-[23.8px]">
                                        excel
                                    </span>
                                    <FileSpreadsheet className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <Separator className="bg-neutral-200/50" />
        </div>
    );
}
