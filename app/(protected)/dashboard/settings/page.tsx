"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/libs/constants/messages";
import { Separator } from "@/components/ui/separator";
import { DESTRUCTION } from "dns";

interface Preferences {
    notifications: {
        toolCompletion: boolean;
        newFeatures: boolean;
        marketing: boolean;
    };
    analyticsOptIn: boolean;
}

const DEFAULT_PREFS: Preferences = {
    notifications: {
        toolCompletion: true,
        newFeatures: true,
        marketing: false,
    },
    analyticsOptIn: true,
};

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [prefs, setPrefs] = useState<Preferences>(() => ({ ...DEFAULT_PREFS }));
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Initialize profile from session
    useEffect(() => {
        if (session?.user) {
            setProfile({
                name: session.user.name || "",
                email: session.user.email || "",
            });
        }
    }, [session]);

    // Load preferences on mount
    useEffect(() => {
        const controller = new AbortController();

        async function loadPreferences() {
            try {
                const res = await fetch("/api/account/preferences", {
                    signal: controller.signal
                });
                if (res.ok) {
                    const json = await res.json();
                    if (!controller.signal.aborted && json.data && Object.keys(json.data).length > 0) {
                        setPrefs((prev) => ({
                            ...prev,
                            ...json.data,
                            notifications: {
                                ...prev.notifications,
                                ...(json.data?.notifications || {}),
                            },
                        }));
                    }
                } else {
                    throw new Error("Failed to load preferences");
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Failed to load preferences:", err);
                    setError("Failed to load settings. Please refresh the page.");
                    toast.error("Could not load your settings. Saving is disabled to prevent data loss.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoaded(true);
                }
            }
        }
        loadPreferences();

        return () => controller.abort();
    }, []);

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            // Save Profile (Name/Email)
            const profileRes = await fetch("/api/account/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (!profileRes.ok) {
                const data = await profileRes.json();
                throw new Error(data.error || "Failed to update profile");
            }

            // Save Preferences
            const prefsRes = await fetch("/api/account/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prefs),
            });

            if (!prefsRes.ok) {
                const data = await prefsRes.json();
                throw new Error(data.error || ERROR_MESSAGES.ACCOUNT.SAVE_FAILED);
            }

            // Update session to reflect new name/email
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: profile.name,
                    email: profile.email,
                },
            });

            toast.success(SUCCESS_MESSAGES.ACCOUNT.SAVED);
        } catch (err: any) {
            toast.error(err.message || ERROR_MESSAGES.ACCOUNT.SAVE_FAILED);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return;
        setDeleting(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || ERROR_MESSAGES.ACCOUNT.DELETE_FAILED);
            }
            toast.success(SUCCESS_MESSAGES.ACCOUNT.DELETED);
            signOut({ callbackUrl: "/" });
        } catch (err: any) {
            toast.error(err.message || ERROR_MESSAGES.ACCOUNT.DELETE_FAILED);
            setDeleting(false);
        }
    };

    if (!loaded) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-[40px] leading-[44px] font-serif font-normal text-foreground mb-8">
                    Settings
                </h1>
                <div className="space-y-8">
                    {/* Account Section Skeleton */}
                    <Skeleton className="w-full" />
                    {/* Notifications Skeleton */}
                    <Skeleton className="w-fullg" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-w-3xl mx-auto py-10">

            {/* Account Section */}
            <section>
                <div className="space-y-10">
                    <div>
                        <h1 className="h1 italic">settings</h1>
                    </div>

                    <Separator />

                    <div className="flex flex-col space-y-2">
                        <label className="font-medium">name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full h-10 px-4 rounded-full border border-border bg-background text-foreground placeholder:text-ink-700 focus:outline-none focus:ring-2 focus:ring-ring transition-colors body"
                        />
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className="font-medium">email address</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full h-10 px-5 rounded-full border border-border bg-background text-foreground placeholder:text-ink-700 focus:outline-none focus:ring-2 focus:ring-ring transition-colors body"
                        />
                    </div>

                    <div className="flex items-center w-full justify-between">
                        <div>
                            <Button
                                onClick={handleSavePreferences}
                                disabled={saving || !loaded || !!error}
                                className="px-8 cursor-pointer"
                            >
                                {saving ? "Saving..." : "Save preferences"}
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                                className="px-8 cursor-pointer"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-card rounded-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] leading-[28px] font-serif font-normal text-foreground">
                            Delete Account
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="body text-muted-foreground">
                            This action is <strong className="text-destructive">permanent and irreversible</strong>.
                            All your data, preferences, and usage history will be deleted.
                        </p>
                        <div>
                            <label className="block p-medium text-foreground mb-1">
                                Type <strong>DELETE</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="body w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setDeleteConfirmText("");
                                }}
                                className="normal-case"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE" || deleting}
                                className="normal-case"
                            >
                                {deleting ? "Deleting..." : "Delete My Account"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
