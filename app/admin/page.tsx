import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import AdminExport from "@/components/AdminExport";
import Image from "next/image";

export const dynamic = "force-dynamic";

// Helper for readable dates
const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export default async function AdminDashboard() {
    // Auth guard: only allow the designated admin
    const session = await auth();
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
        redirect("/");
    }

    await connectMongo();

    // 1. Fetch Stats
    const totalUsers = await User.countDocuments();

    // Last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newUsers24h = await User.countDocuments({ createdAt: { $gte: yesterday } });

    const qrInterests = await User.countDocuments({ interests: "qr" });
    const metadataInterests = await User.countDocuments({ interests: "metadata" });

    // 2. Fetch Users (Limit to last 100 for performance, or fetch all for export)
    const users = await User.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    // For export, we might want ALL users. 
    // In a real app with thousands of users, you'd fetch this via API on demand.
    // For now (MVP), we'll pass the limited set or fetch all if manageable.
    // Let's fetch all lightweight data for the export button separately if needed, 
    // or just use the same list if < 1000 users.
    // We'll stick to the 100 for display, but let's actually fetch all for the export button safely?
    // Actually, let's just use the `users` list we have for now to update UI constraints.
    const allUsersForExport = await User.find().sort({ createdAt: -1 }).select("name email createdAt interests").lean();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-ink-100 pb-4">
                <div>
                    <h1 className="h1 italic text-ink-1000">Overview</h1>
                    <p className="body text-ink-500 mt-1">
                        Platform usage and user growth statistics.
                    </p>
                </div>
                <AdminExport users={JSON.parse(JSON.stringify(allUsersForExport))} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-ink-200 rounded-xl p-6 shadow-sm">
                    <div className="label text-ink-800 uppercase tracking-wider mb-2">Total Users</div>
                    <div className="flex items-baseline gap-2">
                        <div className="h1 text-4xl text-ink-1000">{totalUsers}</div>
                        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            +{newUsers24h} today
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-ink-200 rounded-xl p-6 shadow-sm">
                    <div className="label text-ink-800 uppercase tracking-wider mb-2">Metadata Tool</div>
                    <div className="flex items-baseline gap-2">
                        <div className="h1 text-4xl text-ink-1000">{metadataInterests}</div>
                        <div className="text-sm text-ink-800">
                            users ({(metadataInterests / (totalUsers || 1) * 100).toFixed(0)}%)
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-ink-200 rounded-xl p-6 shadow-sm">
                    <div className="label text-ink-800 uppercase tracking-wider mb-2">QR Code Tool</div>
                    <div className="flex items-baseline gap-2">
                        <div className="h1 text-4xl text-ink-1000">{qrInterests}</div>
                        <div className="text-sm text-ink-800">
                            users ({(qrInterests / (totalUsers || 1) * 100).toFixed(0)}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="border border-ink-200 rounded-xl overflow-hidden bg-white">
                <div className="px-6 py-4 border-b border-ink-100 bg-ink-50 flex justify-between items-center">
                    <h2 className="h2 text-sm font-semibold text-ink-900 uppercase tracking-wide">Recent Users</h2>
                    <span className="text-xs text-ink-800 font-mono">
                        Showing last {users.length} users
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-ink-100">
                                <th className="px-6 py-3 text-xs font-mono uppercase text-ink-700 font-medium">Joined</th>
                                <th className="px-6 py-3 text-xs font-mono uppercase text-ink-700 font-medium">User</th>
                                <th className="px-6 py-3 text-xs font-mono uppercase text-ink-700 font-medium">Interests</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                            {users.map((user: any) => (
                                <tr key={user._id.toString()} className="hover:bg-ink-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-800 font-mono">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-ink-100 flex-shrink-0">
                                                <Image
                                                    src={user.image || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`}
                                                    alt={user.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-ink-900">{user.name || "Unknown"}</div>
                                                <div className="text-xs text-ink-400 font-mono">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {user.interests?.map((interest: string) => (
                                                <span key={interest} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ink-100 text-ink-800 border border-ink-200">
                                                    {interest}
                                                </span>
                                            ))}
                                            {!user.interests?.length && <span className="text-ink-300 text-xs">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
