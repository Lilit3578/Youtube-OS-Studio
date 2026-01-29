"use client";

import React from "react";
import { cn } from "@/libs/utils";

export type FilterType = "all" | "question" | "request" | "feedback";

interface FilterTabsProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    counts: {
        total: number;
        question: number;
        request: number;
        feedback: number;
        other: number;
    };
}

export default function FilterTabs({ currentFilter, onFilterChange, counts }: FilterTabsProps) {
    const tabs: { id: FilterType; label: string }[] = [
        { id: "all", label: "all comments" },
        { id: "question", label: "questions" },
        { id: "request", label: "requests" },
        { id: "feedback", label: "feedback" },
    ];

    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onFilterChange(tab.id)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                        currentFilter === tab.id
                            ? "bg-neutral-200 text-neutral-900"
                            : "bg-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    )}
                >
                    {tab.label}
                    {/* Optional: Show counts if needed, but per design screenshot, it seems just text tabs. 
              The screenshot shows "all comments", "questions", "requests", "feedback". 
              I'll stick to text only for now as per design spec. */}
                </button>
            ))}
        </div>
    );
}
