"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/libs/api";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/libs/constants/messages";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RequestToolModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestToolModal({ isOpen, onClose }: RequestToolModalProps) {
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
            toast.error(ERROR_MESSAGES.FORM.REQUIRED_FIELDS);
            return;
        }

        setLoading(true);

        try {
            await apiClient.post("/request-tool", formData);

            toast.success(SUCCESS_MESSAGES.TOOLS.REQUEST_SUBMITTED);
            // Reset form before closing to avoid flash of empty form
            setFormData({
                toolName: "",
                problemDescription: "",
                usageDescription: "",
                frequency: "",
                priority: "",
                similarTools: "",
                contactConsent: false,
            });
            onClose();
        } catch {
            // apiClient auto-toasts errors and handles 401 redirect
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <DialogHeader className="p-6 border-b border-border">
                    <div>
                        <DialogTitle className="text-[20px] leading-[28px] font-serif font-normal text-foreground">
                            Request a Tool
                        </DialogTitle>
                        <p className="body text-muted-foreground mt-1">
                            Help us build what you need!
                        </p>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Tool Name */}
                    <div>
                        <Label className="block p-medium text-foreground mb-1">
                            Tool Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            type="text"
                            value={formData.toolName}
                            onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                            placeholder="e.g., Subtitle Generator"
                            maxLength={100}
                            className="body"
                        />
                    </div>

                    {/* Problem Description */}
                    <div>
                        <Label className="block p-medium text-foreground mb-1">
                            What problem does it solve? <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            value={formData.problemDescription}
                            onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                            placeholder="Describe the YouTube-related task this tool would help with"
                            maxLength={500}
                            rows={3}
                            className="resize-none"
                        />
                        <p className="caption text-muted-foreground mt-1">
                            {formData.problemDescription.length}/500 characters
                        </p>
                    </div>

                    {/* Usage Description */}
                    <div>
                        <Label className="block p-medium text-foreground mb-1">
                            How would you use it?
                        </Label>
                        <Textarea
                            value={formData.usageDescription}
                            onChange={(e) => setFormData({ ...formData, usageDescription: e.target.value })}
                            placeholder="Describe your ideal workflow with this tool"
                            maxLength={500}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <Label className="block p-medium text-foreground mb-2">
                            How often would you use this? <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                            value={formData.frequency}
                            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        >
                            {['daily', 'weekly', 'monthly', 'rarely'].map((freq) => (
                                <div key={freq} className="flex items-center space-x-2">
                                    <RadioGroupItem value={freq} id={`freq-${freq}`} />
                                    <Label htmlFor={`freq-${freq}`} className="body text-foreground capitalize cursor-pointer">
                                        {freq}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Priority */}
                    <div>
                        <Label className="block p-medium text-foreground mb-2">
                            Priority
                        </Label>
                        <RadioGroup
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                            {['critical', 'high', 'medium', 'low'].map((pri) => (
                                <div key={pri} className="flex items-center space-x-2">
                                    <RadioGroupItem value={pri} id={`pri-${pri}`} />
                                    <Label htmlFor={`pri-${pri}`} className="text-sm text-foreground capitalize cursor-pointer">
                                        {pri}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Similar Tools */}
                    <div>
                        <Label className="block p-medium text-foreground mb-1">
                            Similar Tools
                        </Label>
                        <Input
                            type="text"
                            value={formData.similarTools}
                            onChange={(e) => setFormData({ ...formData, similarTools: e.target.value })}
                            placeholder="Are there existing tools that do something similar?"
                            maxLength={200}
                        />
                    </div>

                    {/* Contact Consent */}
                    <div className="pt-2 border-t border-border">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="contact-consent"
                                checked={formData.contactConsent}
                                onCheckedChange={(checked) => setFormData({ ...formData, contactConsent: checked as boolean })}
                            />
                            <Label htmlFor="contact-consent" className="body text-foreground cursor-pointer">
                                We may reach out to you for more details about this tool request
                            </Label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="normal-case cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={loading}
                            className="normal-case cursor-pointer"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
