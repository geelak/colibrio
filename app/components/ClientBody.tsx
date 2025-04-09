'use client';

import React, { useEffect } from 'react';
import { use100vh, getTrueVH } from './ViewportHeightFix';

interface ClientBodyProps {
	children: React.ReactNode;
	geistSans: string;
	geistMono: string;
}

export default function ClientBody({ children, geistSans, geistMono }: ClientBodyProps) {
	const true100vh = use100vh();

	useEffect(() => {
		console.log('ClientBody useEffect triggered with true100vh:', true100vh);
		if (true100vh) {
			// Set the CSS variable at the document root level
			document.documentElement.style.setProperty('--visibleVH', `${true100vh}px`);
		}
	}, [true100vh]);

	return (
		<body
			className={`${geistSans} ${geistMono} antialiased overflow-hidden w-screen`}
			style={{ height: true100vh ?? '100vh' }}
		>
			{children}
		</body>
	);
} 