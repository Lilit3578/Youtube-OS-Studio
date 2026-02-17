import { ReactNode } from "react";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
    title: `Settings | ${config.appName}`,
    description: "Manage your account preferences, export settings, and notification preferences.",
    extraTags: {
        robots: { index: false, follow: false },
    },
});

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
