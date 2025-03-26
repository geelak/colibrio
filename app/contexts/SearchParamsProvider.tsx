'use client';

import React, { createContext, useContext, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchParamsContext = createContext<URLSearchParams | null>(null);

// Create a separate component that uses useSearchParams
function SearchParamsContent({ children }: { children: React.ReactNode }) {
	const searchParams = useSearchParams();

	const memoizedParams = useMemo(() => {
		return new URLSearchParams(searchParams.toString());
	}, [searchParams]);

	return (
		<SearchParamsContext.Provider value={memoizedParams}>
			{children}
		</SearchParamsContext.Provider>
	);
}

// Wrap the component that uses useSearchParams in Suspense
export const SearchParamsProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchParamsContent>{children}</SearchParamsContent>
		</Suspense>
	);
};

export const useSearchParamsContext = () => {
	const context = useContext(SearchParamsContext);
	if (!context) throw new Error('useSearchParamsContext must be used within SearchParamsProvider');
	return context;
};
