"use client";

import { useState } from "react";
import writeXlsxFile from "write-excel-file";
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

            const schema = [
                {
                    column: "Name",
                    type: String,
                    value: (student: UserData) => student.name,
                    width: 25
                },
                {
                    column: "Email",
                    type: String,
                    value: (student: UserData) => student.email,
                    width: 35
                },
                {
                    column: "Created At",
                    type: String,
                    value: (student: UserData) => student.createdAt,
                    width: 15
                },
                {
                    column: "Interests",
                    type: String,
                    value: (student: UserData) => student.interests,
                    width: 40
                }
            ];

            await writeXlsxFile(data, {
                schema,
                fileName: `users_export_${new Date().toISOString().split("T")[0]}.xlsx`,
                headerStyle: {
                    fontWeight: "bold"
                }
            });

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
            className="btn btn-primary btn-sm cursor-pointer"
        >
            {loading ? "Exporting..." : "Export CSV"}
        </button>
    );
}
