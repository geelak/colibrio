'use client';

import React, { useEffect } from 'react';
import { use100vh } from 'react-div-100vh';

interface ClientBodyProps {
	children: React.ReactNode;
	geistSans: string;
	geistMono: string;
}

export default function ClientBody({ children, geistSans, geistMono }: ClientBodyProps) {
	const true100vh = use100vh() as number;

	useEffect(() => {
		// Set the CSS variable at the document root level
		document.documentElement.style.setProperty('--visibleVH', `${true100vh}px`);
	}, [true100vh]);

	return (
		<body
			className={`${geistSans} ${geistMono} antialiased overflow-hidden w-screen`}
			style={{ height: true100vh }}
		>
			{children}
		</body>
	);
} 