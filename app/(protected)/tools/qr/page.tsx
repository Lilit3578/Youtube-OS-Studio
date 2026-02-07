import RegisterInterest from "@/components/RegisterInterest";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
    title: `QR Code Generator | ${config.appName}`,
    description: "Generate custom branded QR codes for your YouTube videos, channels, and playlists.",
    extraTags: {
        robots: { index: false, follow: false },
    },
});

export default function QRToolPage() {
    return (
        <RegisterInterest
            toolId="qr"
            toolName="generate qr code"
            description="Create custom branded QR codes for your YouTube content, channels, and playlists."
        />
    );
}
