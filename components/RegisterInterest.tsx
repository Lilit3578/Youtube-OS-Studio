"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import toast from "react-hot-toast";

interface RegisterInterestProps {
    toolId: string;
    toolName: string;
    description: string;
}

export default function RegisterInterest({
    toolId,
    toolName,
    description,
}: RegisterInterestProps) {
    const [registered, setRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if user already registered interest
    useEffect(() => {
        async function check() {
            try {
                const res = await fetch(
                    `/api/register-interest?toolId=${encodeURIComponent(toolId)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setRegistered(data.registered);
                }
            } catch {
                // Silently fail — button will default to unregistered
            } finally {
                setChecking(false);
            }
        }
        check();
    }, [toolId]);

    const handleRegister = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/register-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to register");
            }

            setRegistered(true);
            toast.success("You're on the list!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="p-4 bg-ink-100 rounded-2xl">
                        <Sparkles
                            className="w-10 h-10 text-primary"
                            strokeWidth={1.5}
                        />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                    <h2 className="text-[28px] leading-[32px] font-serif font-normal text-foreground">
                        {toolName}
                    </h2>
                    <p className="body text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                {/* Status badge */}
                <div className="flex justify-center">
                    <span className="text-[10px] px-3 py-1.5 rounded-full bg-ink-200 text-muted-foreground font-medium uppercase tracking-wider">
                        Coming Soon
                    </span>
                </div>

                {/* Register Button */}
                {checking ? (
                    <div className="h-12" />
                ) : registered ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Check className="w-5 h-5" strokeWidth={2} />
                            <span className="p-medium">Interest registered</span>
                        </div>
                        <p className="caption text-muted-foreground">
                            We&apos;ll notify you when this tool launches.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className="normal-case px-8 h-12 text-base cursor-pointer"
                            size="lg"
                        >
                            {loading ? "Registering..." : "Register Interest"}
                        </Button>
                        <p className="caption text-muted-foreground">
                            Get notified when this tool is ready.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
