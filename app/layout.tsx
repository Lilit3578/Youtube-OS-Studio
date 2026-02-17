import { ReactNode } from "react";
import { Instrument_Serif, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "@/libs/utils";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
	weight: ["400"],
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-instrument-serif",
	display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
	weight: ["300", "400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-be-vietnam-pro",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
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
			className={`${beVietnamPro.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}

