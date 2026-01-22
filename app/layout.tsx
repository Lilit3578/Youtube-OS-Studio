import { ReactNode } from "react";
import { Inter, Instrument_Serif, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "@/libs/utils";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
	weight: ["400"],
	subsets: ["latin"],
	variable: "--font-instrument-serif",
	style: "italic"
});
const beVietnamPro = Be_Vietnam_Pro({
	weight: ["300", "400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-be-vietnam-pro"
});
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono"
});

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={`${font.className} ${instrumentSerif.variable} ${beVietnamPro.variable} ${jetbrainsMono.variable}`}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
