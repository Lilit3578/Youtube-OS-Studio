"use client";

import React from "react";
import { cn } from "@/libs/utils";

import { MessageSquare, Copy } from "lucide-react";

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
        <div className="flex items-center justify-between mb-6 gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onFilterChange(tab.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                            currentFilter === tab.id
                                ? "bg-neutral-200 text-neutral-900"
                                : "bg-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full",
                                currentFilter === tab.id ? "bg-neutral-300" : "bg-neutral-100"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={onCopyAll}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
            >
                <Copy className="w-3.5 h-3.5" />
                COPY ALL
            </button>
        </div>
    );
}
