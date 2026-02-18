"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import toast from "react-hot-toast";

interface UserData {
    name: string;
    email: string;
    createdAt: string;
    interests: string;
}

interface AdminUser {
    name?: string;
    email: string;
    createdAt: string;
    interests?: string[];
}

export default function AdminExport({ users }: { users: AdminUser[] }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);

            const data: UserData[] = users.map(user => ({
                name: user.name || "N/A",
                email: user.email,
                createdAt: new Date(user.createdAt).toLocaleDateString(),
                interests: user.interests?.join(", ") || "",
            }));

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Users");

            // Define columns with headers
            worksheet.columns = [
                { header: "Name", key: "name", width: 25 },
                { header: "Email", key: "email", width: 35 },
                { header: "Created At", key: "createdAt", width: 15 },
                { header: "Interests", key: "interests", width: 40 },
            ];

            // Style the header row
            worksheet.getRow(1).font = { bold: true };

            // Add data rows
            worksheet.addRows(data);

            // Generate the file as a buffer and trigger download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

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
