"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import config, { toolsConfig } from "@/config";
import Image from "next/image";

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="drawer-side z-50 lg:h-auto w-72 lg:w-72 border-r border-base-300 bg-base-100 hidden lg:block">
            <div className="h-full flex flex-col p-4">
                {/* Logo */}
                <div className="mb-8 px-2 flex items-center gap-2">
                    <div className="font-bold text-xl">{config.appName}</div>
                </div>

                {/* Navigation */}
                <ul className="menu w-full p-0 gap-2 text-base-content/90">
                    <li>
                        <Link
                            href="/dashboard"
                            className={`${pathname === "/dashboard" || pathname === "/dashboard/settings"
                                ? "active !bg-primary text-primary-content"
                                : ""
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                                />
                            </svg>
                            Dashboard
                        </Link>
                    </li>

                    <div className="divider my-2"></div>
                    <li className="menu-title">Tools</li>

                    {toolsConfig.map((tool) => (
                        <li key={tool.id}>
                            {tool.status === "active" ? (
                                <Link
                                    href={tool.href}
                                    className={`${pathname.startsWith(tool.href)
                                        ? "active !bg-primary text-primary-content"
                                        : ""
                                        }`}
                                >
                                    {tool.name}
                                </Link>
                            ) : (
                                <span className="opacity-50 cursor-not-allowed justify-between">
                                    {tool.name}
                                    <span className="badge badge-xs badge-ghost">Soon</span>
                                </span>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto">
                    {/* Bottom content if needed */}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
