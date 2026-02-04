import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-base-content mb-8">Settings</h1>

            {/* Account Section */}
            <section className="mb-8 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">Account</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={session.user?.name || ""}
                            disabled
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Your name from Google account</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={session.user?.email || ""}
                            disabled
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Your email from Google account</p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                            Delete Account
                        </button>
                        <p className="text-xs text-neutral-500 mt-1">Permanently delete your account and all data</p>
                    </div>
                </div>
            </section>

            {/* API Keys Section */}
            <section className="mb-8 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">API Keys</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">YouTube Data API Key</label>
                        <input
                            type="text"
                            placeholder="Enter your YouTube API key"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Required for accessing YouTube data. <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get your API key</a>
                        </p>
                    </div>

                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium">
                        Save API Key
                    </button>
                </div>
            </section>

            {/* Export Preferences Section */}
            <section className="mb-8 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">Export Preferences</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Default Export Format</label>
                        <select className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
                            <option value="csv">CSV</option>
                            <option value="xlsx">Excel (XLSX)</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Date Format</label>
                        <select className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
                            <option value="us">MM/DD/YYYY (US)</option>
                            <option value="eu">DD/MM/YYYY (EU)</option>
                            <option value="iso">YYYY-MM-DD (ISO)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Timezone</label>
                        <select className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
                            <option value="utc">UTC</option>
                            <option value="local">Local Time</option>
                            <option value="pst">PST (Pacific)</option>
                            <option value="est">EST (Eastern)</option>
                            <option value="cet">CET (Central European)</option>
                        </select>
                    </div>

                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium">
                        Save Preferences
                    </button>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="mb-8 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">Notifications</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Tool Completion Notifications</p>
                            <p className="text-xs text-neutral-500">Get notified when long-running tasks complete</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-700">New Feature Announcements</p>
                            <p className="text-xs text-neutral-500">Stay updated on new tools and features</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Marketing Emails</p>
                            <p className="text-xs text-neutral-500">Receive tips, tutorials, and promotional content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Privacy & Data Section */}
            <section className="mb-8 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">Privacy & Data</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Analytics</p>
                            <p className="text-xs text-neutral-500">Help us improve by sharing anonymous usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                        <button className="text-sm text-neutral-700 hover:text-neutral-900 font-medium mb-2 block">
                            Download My Data
                        </button>
                        <p className="text-xs text-neutral-500 mb-4">Export all your data in JSON format</p>

                        <button className="text-sm text-neutral-700 hover:text-neutral-900 font-medium mb-2 block">
                            Clear Browser Cache
                        </button>
                        <p className="text-xs text-neutral-500">Clear all locally stored data and preferences</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
