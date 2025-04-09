'use client';

import React, { useEffect } from 'react';
import { use100vh, getTrueVH } from './ViewportHeightFix';
import logger from '@/utils/logger';

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
			
			// Log to remote server
			logger.info('ClientBody set visibleVH CSS var', { 
				value: true100vh,
				bodyStyleHeight: document.body.style.height,
				windowInnerHeight: window.innerHeight,
				documentHeight: document.documentElement.clientHeight
			});
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