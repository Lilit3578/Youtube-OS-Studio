"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import toast from "react-hot-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/libs/constants/messages";

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
                throw new Error(data.error || ERROR_MESSAGES.TOOLS.REGISTER_FAILED);
            }

            setRegistered(true);
            toast.success(SUCCESS_MESSAGES.TOOLS.INTEREST_REGISTERED);
        } catch (err: any) {
            toast.error(err.message || ERROR_MESSAGES.GLOBAL.GENERIC);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
            {/* Status badge */}
              <div className="flex justify-center label">
                <span>
                    Coming Soon
                </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
                <h2 className="h2">
                    {toolName}
                </h2>
                <p className="max-w-sm mx-auto">
                    {description}
                </p>
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
                <div className="space-y-10">
                    <Button
                        onClick={handleRegister}
                        disabled={loading}
                        className="px-8 cursor-pointer"
                    >
                        {loading ? "Registering..." : "Register Interest"}
                    </Button>
                    <p className="caption text-ink-800">
                        Get notified when this tool is ready.
                    </p>
                </div>
                )}
            </div>
    );
}
