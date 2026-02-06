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
import toast from "react-hot-toast";

interface Preferences {
    exportFormat: string;
    dateFormat: string;
    timezone: string;
    notifications: {
        toolCompletion: boolean;
        newFeatures: boolean;
        marketing: boolean;
    };
    analyticsOptIn: boolean;
}

const DEFAULT_PREFS: Preferences = {
    exportFormat: "csv",
    dateFormat: "iso",
    timezone: "utc",
    notifications: {
        toolCompletion: true,
        newFeatures: true,
        marketing: false,
    },
    analyticsOptIn: true,
};

export default function SettingsPage() {
    const { data: session } = useSession();
    const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Load preferences on mount
    useEffect(() => {
        async function loadPreferences() {
            try {
                const res = await fetch("/api/account/preferences");
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && Object.keys(json.data).length > 0) {
                        setPrefs((prev) => ({
                            ...prev,
                            ...json.data,
                            notifications: {
                                ...prev.notifications,
                                ...json.data.notifications,
                            },
                        }));
                    }
                }
            } catch {
                // Silently use defaults
            } finally {
                setLoaded(true);
            }
        }
        loadPreferences();
    }, []);

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/account/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prefs),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }
            toast.success("Preferences saved");
        } catch (err: any) {
            toast.error(err.message || "Failed to save preferences");
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
                throw new Error(data.error || "Failed to delete account");
            }
            toast.success("Account deleted");
            signOut({ callbackUrl: "/" });
        } catch (err: any) {
            toast.error(err.message || "Failed to delete account");
            setDeleting(false);
        }
    };

    if (!loaded) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-[40px] leading-[44px] font-serif font-normal text-foreground mb-8">
                    Settings
                </h1>
                <div className="animate-pulse space-y-8">
                    <div className="h-48 bg-accent rounded-lg" />
                    <div className="h-64 bg-accent rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-[40px] leading-[44px] font-serif font-normal text-foreground mb-8">
                Settings
            </h1>

            {/* Account Section */}
            <section className="mb-8 bg-card rounded-lg border border-border p-6">
                <h2 className="text-[20px] leading-[28px] font-serif font-normal text-foreground mb-4">
                    Account
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block p-medium text-foreground mb-1">Name</label>
                        <input
                            type="text"
                            value={session?.user?.name || ""}
                            disabled
                            className="body w-full px-3 py-2 border border-input rounded-md bg-accent text-muted-foreground cursor-not-allowed"
                        />
                        <p className="caption text-muted-foreground mt-1">
                            Your name from Google account
                        </p>
                    </div>
                    <div>
                        <label className="block p-medium text-foreground mb-1">Email</label>
                        <input
                            type="email"
                            value={session?.user?.email || ""}
                            disabled
                            className="body w-full px-3 py-2 border border-input rounded-md bg-accent text-muted-foreground cursor-not-allowed"
                        />
                        <p className="caption text-muted-foreground mt-1">
                            Your email from Google account
                        </p>
                    </div>
                    <div className="pt-4 border-t border-border">
                        <button
                            onClick={() => setDeleteDialogOpen(true)}
                            className="p-medium text-destructive hover:text-destructive/90 cursor-pointer"
                        >
                            Delete Account
                        </button>
                        <p className="caption text-muted-foreground mt-1">
                            Permanently delete your account and all data
                        </p>
                    </div>
                </div>
            </section>

            {/* Export Preferences Section */}
            <section className="mb-8 bg-card rounded-lg border border-border p-6">
                <h2 className="text-[20px] leading-[28px] font-serif font-normal text-foreground mb-4">
                    Export Preferences
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block p-medium text-foreground mb-1">
                            Default Export Format
                        </label>
                        <select
                            value={prefs.exportFormat}
                            onChange={(e) =>
                                setPrefs({ ...prefs, exportFormat: e.target.value })
                            }
                            className="body w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="csv">CSV</option>
                            <option value="xlsx">Excel (XLSX)</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <div>
                        <label className="block p-medium text-foreground mb-1">
                            Date Format
                        </label>
                        <select
                            value={prefs.dateFormat}
                            onChange={(e) =>
                                setPrefs({ ...prefs, dateFormat: e.target.value })
                            }
                            className="body w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="us">MM/DD/YYYY (US)</option>
                            <option value="eu">DD/MM/YYYY (EU)</option>
                            <option value="iso">YYYY-MM-DD (ISO)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block p-medium text-foreground mb-1">Timezone</label>
                        <select
                            value={prefs.timezone}
                            onChange={(e) =>
                                setPrefs({ ...prefs, timezone: e.target.value })
                            }
                            className="body w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="utc">UTC</option>
                            <option value="local">Local Time</option>
                            <option value="pst">PST (Pacific)</option>
                            <option value="est">EST (Eastern)</option>
                            <option value="cet">CET (Central European)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="mb-8 bg-card rounded-lg border border-border p-6">
                <h2 className="text-[20px] leading-[28px] font-serif font-normal text-foreground mb-4">
                    Notifications
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="p-medium text-foreground">
                                Tool Completion Notifications
                            </p>
                            <p className="caption text-muted-foreground">
                                Get notified when long-running tasks complete
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={prefs.notifications.toolCompletion}
                                onChange={(e) =>
                                    setPrefs({
                                        ...prefs,
                                        notifications: {
                                            ...prefs.notifications,
                                            toolCompletion: e.target.checked,
                                        },
                                    })
                                }
                            />
                            <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="p-medium text-foreground">
                                New Feature Announcements
                            </p>
                            <p className="caption text-muted-foreground">
                                Stay updated on new tools and features
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={prefs.notifications.newFeatures}
                                onChange={(e) =>
                                    setPrefs({
                                        ...prefs,
                                        notifications: {
                                            ...prefs.notifications,
                                            newFeatures: e.target.checked,
                                        },
                                    })
                                }
                            />
                            <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="p-medium text-foreground">Marketing Emails</p>
                            <p className="caption text-muted-foreground">
                                Receive tips, tutorials, and promotional content
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={prefs.notifications.marketing}
                                onChange={(e) =>
                                    setPrefs({
                                        ...prefs,
                                        notifications: {
                                            ...prefs.notifications,
                                            marketing: e.target.checked,
                                        },
                                    })
                                }
                            />
                            <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
                        </label>
                    </div>
                </div>
            </section>

            {/* Privacy & Data Section */}
            <section className="mb-8 bg-card rounded-lg border border-border p-6">
                <h2 className="text-[20px] leading-[28px] font-serif font-normal text-foreground mb-4">
                    Privacy & Data
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="p-medium text-foreground">Analytics</p>
                            <p className="caption text-muted-foreground">
                                Help us improve by sharing anonymous usage data
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={prefs.analyticsOptIn}
                                onChange={(e) =>
                                    setPrefs({ ...prefs, analyticsOptIn: e.target.checked })
                                }
                            />
                            <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
                        </label>
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end mb-12">
                <Button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="normal-case px-8"
                >
                    {saving ? "Saving..." : "Save Preferences"}
                </Button>
            </div>

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
