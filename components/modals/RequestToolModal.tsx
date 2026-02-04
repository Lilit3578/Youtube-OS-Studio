"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface RequestToolModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestToolModal({ isOpen, onClose }: RequestToolModalProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        toolName: "",
        problemDescription: "",
        usageDescription: "",
        frequency: "",
        priority: "",
        similarTools: "",
        contactConsent: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.toolName || !formData.problemDescription || !formData.frequency) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/request-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to submit");

            toast.success("Request submitted successfully!");
            onClose();
            // Reset form
            setFormData({
                toolName: "",
                problemDescription: "",
                usageDescription: "",
                frequency: "",
                priority: "",
                similarTools: "",
                contactConsent: false,
            });
        } catch (error) {
            toast.error("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div>
                        <h2 className="text-xl font-semibold text-base-content">Request a Tool</h2>
                        <p className="text-sm text-neutral-500 mt-1">Help us build what you need!</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Tool Name */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Tool Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.toolName}
                            onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                            placeholder="e.g., Subtitle Generator"
                            maxLength={100}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                    </div>

                    {/* Problem Description */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            What problem does it solve? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.problemDescription}
                            onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                            placeholder="Describe the YouTube-related task this tool would help with"
                            maxLength={500}
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            {formData.problemDescription.length}/500 characters
                        </p>
                    </div>

                    {/* Usage Description */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            How would you use it?
                        </label>
                        <textarea
                            value={formData.usageDescription}
                            onChange={(e) => setFormData({ ...formData, usageDescription: e.target.value })}
                            placeholder="Describe your ideal workflow with this tool"
                            maxLength={500}
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            How often would you use this? <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {['daily', 'weekly', 'monthly', 'rarely'].map((freq) => (
                                <label key={freq} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value={freq}
                                        checked={formData.frequency === freq}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <span className="ml-2 text-sm text-neutral-700 capitalize">{freq}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Priority
                        </label>
                        <div className="space-y-2">
                            {['critical', 'high', 'medium', 'low'].map((pri) => (
                                <label key={pri} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={pri}
                                        checked={formData.priority === pri}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <span className="ml-2 text-sm text-neutral-700 capitalize">{pri}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Similar Tools */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Similar Tools
                        </label>
                        <input
                            type="text"
                            value={formData.similarTools}
                            onChange={(e) => setFormData({ ...formData, similarTools: e.target.value })}
                            placeholder="Are there existing tools that do something similar?"
                            maxLength={200}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                    </div>

                    {/* Contact Consent */}
                    <div className="pt-2 border-t border-neutral-200">
                        <label className="flex items-start">
                            <input
                                type="checkbox"
                                checked={formData.contactConsent}
                                onChange={(e) => setFormData({ ...formData, contactConsent: e.target.checked })}
                                className="w-4 h-4 mt-0.5 text-neutral-900 focus:ring-neutral-900 rounded"
                            />
                            <span className="ml-2 text-sm text-neutral-700">
                                We may reach out to you for more details about this tool request
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
