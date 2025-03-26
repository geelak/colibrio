'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchParamsContext = createContext<URLSearchParams | null>(null);

export const SearchParamsProvider = ({ children }: { children: React.ReactNode }) => {
	const searchParams = useSearchParams();

	const memoizedParams = useMemo(() => {
		return new URLSearchParams(searchParams.toString());
	}, [searchParams]);

	return (
		<SearchParamsContext.Provider value={memoizedParams}>
			{children}
		</SearchParamsContext.Provider>
	);
};

export const useSearchParamsContext = () => {
	const context = useContext(SearchParamsContext);
	if (!context) throw new Error('useSearchParamsContext must be used within SearchParamsProvider');
	return context;
};
