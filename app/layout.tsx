import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SearchParamsProvider } from "./contexts/SearchParamsProvider";
import { ClientThemeProvider } from "./contexts/theme/ThemeProvider";
import ClientBody from './components/ClientBody';

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Legible Living Books: R&D Demo Environment",
	description: "v0.1.8",
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	interactiveWidget: 'resizes-visual',
  }

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<Suspense fallback={
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<div className="theme-loading-fallback" />
				</body>
			}>
				<ClientBody
					geistSans={geistSans.variable}
					geistMono={geistMono.variable}
				>
					<ClientThemeProvider>
						<SearchParamsProvider>
							{/* CSS Version Indicator */}
							<div className="css-version-indicator"></div>
							{children}
						</SearchParamsProvider>
					</ClientThemeProvider>
				</ClientBody>
			</Suspense>
		</html>
	);
}
