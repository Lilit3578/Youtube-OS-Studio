"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface UserData {
    name: string;
    email: string;
    createdAt: string;
    interests: string;
    marketing: string;
}

export default function AdminExport({ users }: { users: any[] }) {
    const [loading, setLoading] = useState(false);

    const handleExport = () => {
        try {
            setLoading(true);

            const data: UserData[] = users.map(user => ({
                name: user.name || "N/A",
                email: user.email,
                createdAt: new Date(user.createdAt).toLocaleDateString(),
                interests: user.interests?.join(", ") || "",
                marketing: user.preferences?.notifications?.marketing ? "Yes" : "No",
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

            XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Export successful!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="btn btn-primary btn-sm"
        >
            {loading ? "Exporting..." : "Export CSV"}
        </button>
    );
}
