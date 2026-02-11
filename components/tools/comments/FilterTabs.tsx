"use client";

import React from "react";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export type FilterType = "all" | "question" | "request" | "feedback";

interface FilterTabsProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onCopyAll: () => void;
    counts: {
        total: number;
        question: number;
        request: number;
        feedback: number;
        other: number;
    };
}

export default function FilterTabs({ currentFilter, onFilterChange, onCopyAll, counts }: FilterTabsProps) {
    const tabs: { id: FilterType; label: string; count: number }[] = [
        { id: "all", label: "all comments", count: counts.total },
        { id: "question", label: "questions", count: counts.question },
        { id: "request", label: "requests", count: counts.request },
        { id: "feedback", label: "feedback", count: counts.feedback },
    ];

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            onClick={() => onFilterChange(tab.id)}
                            className={cn(
                                "body font-medium px-4 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-2 h-auto !normal-case cursor-pointer",
                                currentFilter === tab.id
                                    ? "bg-ink-400 text-ink-1000"
                                    : "bg-transparent text-ink-800"
                            )}
                        >
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span className="body font-medium">
                                    {tab.count}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    onClick={onCopyAll}
                    className="flex items-center gap-2 label text-ink-700 hover:text-ink-1000 h-auto shrink-0 px-3 py-1.5"
                >
                    <Copy className="w-3.5 h-3.5" />
                    COPY ALL
                </Button>

            </div>
            <Separator className="bg-ink-200 mt-4" />
        </>
    );
}
