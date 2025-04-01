import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SearchParamsProvider } from "./contexts/SearchParamsProvider";
import { ClientThemeProvider } from "./contexts/theme/ThemeProvider";
import ViewportHeightFix from "./components/ViewportHeightFix";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Metadata needs to be in a separate file for server component
export const metadata: Metadata = {
	title: "Legible Living Books: R&D Demo Environment",
	description: "v0.1.8",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden w-screen h-screen`}
			>
				<Suspense fallback={<div className="theme-loading-fallback" />}>
					<ClientThemeProvider>
						<SearchParamsProvider>
							<ViewportHeightFix>
								{children}
							</ViewportHeightFix>
						</SearchParamsProvider>
					</ClientThemeProvider>
				</Suspense>
			</body>
		</html>
	);
}
