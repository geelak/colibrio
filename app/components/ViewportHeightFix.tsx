'use client';

import { useEffect, useState } from "react";
import logger from "@/utils/logger";

interface ViewportHeightFixProps {
	children: React.ReactNode;
}

// Store the current viewport height in a module-level variable
let currentVH: number | null = null;

// Function to get the current viewport height
export function getTrueVH(): number | null {
	return currentVH;
}

export function use100vh(): number | null {
	const [height, setHeight] = useState<number | null>(null);

	useEffect(() => {
		const setViewportHeight = () => {
			const visualViewportHeight = window.visualViewport?.height;
			const clientHeight = document.documentElement?.clientHeight;
			const innerHeight = window.innerHeight;

			// Log height measurements to remote server
			logger.info("Viewport measurements", {
				visualViewportHeight,
				clientHeight,
				innerHeight,
				userAgent: navigator.userAgent,
				orientation: window.screen?.orientation?.type || "unknown",
				screenWidth: window.screen?.width,
				screenHeight: window.screen?.height,
				devicePixelRatio: window.devicePixelRatio
			});

			const windowHeight =
				(window.visualViewport?.height) ||
				document.documentElement?.clientHeight ||
				window.innerHeight;

			setHeight(windowHeight);
			// Update the module-level variable
			currentVH = windowHeight;
			
			// Log the selected height
			logger.debug("Selected viewport height", { 
				selectedHeight: windowHeight,
				source: windowHeight === visualViewportHeight ? "visualViewport" : 
						windowHeight === clientHeight ? "clientHeight" : "innerHeight"
			});
		};

		// Set initial value
		setViewportHeight();

		// Listen to the appropriate events
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', setViewportHeight);
			window.visualViewport.addEventListener('scroll', setViewportHeight);
		} else {
			window.addEventListener('resize', setViewportHeight);
			window.addEventListener('orientationchange', setViewportHeight);
		}

		// Update on any orientation change
		window.addEventListener('orientationchange', () => {
			// Slight delay to ensure values are updated
			setTimeout(setViewportHeight, 100);
		});

		return () => {
			// Clean up
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', setViewportHeight);
				window.visualViewport.removeEventListener('scroll', setViewportHeight);
			} else {
				window.removeEventListener('resize', setViewportHeight);
				window.removeEventListener('orientationchange', setViewportHeight);
			}
			window.removeEventListener('orientationchange', setViewportHeight);
		};
	}, []);

	return height;
}

export default function ViewportHeightFix({ children }: ViewportHeightFixProps) {
	// Set viewport height CSS variable
	useEffect(() => {
		const setViewportHeight = () => {
			const visualViewportHeight = window.visualViewport?.height;
			const clientHeight = document.documentElement?.clientHeight;
			const innerHeight = window.innerHeight;

			// Log measurements from ViewportHeightFix component
			logger.info("ViewportHeightFix component measurements", {
				visualViewportHeight,
				clientHeight,
				innerHeight,
			});

			const height =
				(window.visualViewport?.height) ||
				document.documentElement?.clientHeight ||
				window.innerHeight;

			// Set the custom property
			const vh = height * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
			
			// Log the CSS variable setting
			logger.debug("ViewportHeightFix set CSS variable", { 
				height,
				vh: `${vh}px`,
				cssVar: '--vh'
			});
		};

		// Set initial value
		setViewportHeight();

		// Listen to the appropriate events
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', setViewportHeight);
			window.visualViewport.addEventListener('scroll', setViewportHeight);
		} else {
			window.addEventListener('resize', setViewportHeight);
			window.addEventListener('orientationchange', setViewportHeight);
		}

		// Update on any orientation change
		window.addEventListener('orientationchange', () => {
			// Log orientation change
			logger.info("Orientation change detected", {
				orientation: window.screen?.orientation?.type || "unknown"
			});
			
			// Slight delay to ensure values are updated
			setTimeout(setViewportHeight, 100);
		});

		return () => {
			// Clean up
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', setViewportHeight);
				window.visualViewport.removeEventListener('scroll', setViewportHeight);
			} else {
				window.removeEventListener('resize', setViewportHeight);
				window.removeEventListener('orientationchange', setViewportHeight);
			}
			window.removeEventListener('orientationchange', setViewportHeight);
		};
	}, []);

	return (
		<div
			className="w-full h-full"
			style={{
				height: 'calc(var(--vh, 1vh) * 100)'
			}}
		>
			{children}
		</div>
	);
} 