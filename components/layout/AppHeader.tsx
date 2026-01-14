"use client";

import { useSession } from "next-auth/react";
import ButtonAccount from "@/components/ButtonAccount";

const AppHeader = () => {
    const { data: session } = useSession();

    return (
        <header className="navbar bg-base-200 border-b border-base-300 min-h-[4rem] px-4 justify-between">
            <div className="flex-1 lg:hidden">
                {/* Mobile menu button could go here */}
                <span className="font-bold text-lg">Youtube OS</span>
            </div>
            <div className="flex-none gap-4">
                {session ? <ButtonAccount /> : null}
            </div>
        </header>
    );
};

export default AppHeader;
