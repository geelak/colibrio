'use client';

// Polyfill for URL.canParse if not available
if (typeof window !== 'undefined' && typeof URL.canParse !== 'function') {
	URL.canParse = (url) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};
}

import { useEffect, useRef, useState } from 'react';

// Import custom hook for accessing search parameters
import { 
	useSearchParamsContext 
} from './contexts/SearchParamsProvider';

// Import necessary components from Colibrio Reader Framework
import { 
	ReadingSystemEngine 
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-engine';

import { 
	EpubFormatAdapter 
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-formatadapter-epub';

import {
	EpubOcfResourceProvider,
} from '@colibrio/colibrio-reader-framework/colibrio-core-publication-epub';

import {
	FlipBookRenderer,
	SingleDocumentScrollRenderer,
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-renderer';

import {
	IReaderPublication,
	IReaderView,
	// @ts-ignore
	ContentDisplayAreaType,
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

// Export dynamic setting for Next.js
export const dynamic = 'force-dynamic';

/**
 * Main component for the demo reader page.
 * Handles the initialization and rendering of the Colibrio reader.
 */
export default function DemoReaderPage() {
	// Refs for various components and states
	const containerRef = useRef<HTMLDivElement | null>(null);
	const engineRef = useRef<ReadingSystemEngine>(null);
	const readerViewRef = useRef<IReaderView>(null);
	const publicationRef = useRef<IReaderPublication>(null);

	// State variables for pagination and navigation
	const [currentPage, setCurrentPage] = useState<number>();
	const [totalPages, setTotalPages] = useState<number>();
	const [canGoNext, setCanGoNext] = useState(true);
	const [canGoPrev, setCanGoPrev] = useState(false);
	const [readerView, setReaderView] = useState<IReaderView | null>(null);
	const [epubUrl, setEpubUrl] = useState<string | null>(null);

	// Get search parameters from context
	const searchParams = useSearchParamsContext();

	/**
	 * Effect to set the EPUB URL from search parameters.
	 * This will be used to load the EPUB file into the reader.
	 */
	useEffect(() => {
		const epub = searchParams.get('epub');
		setEpubUrl(epub || '/demo/demo.epub');
	}, [searchParams]);

	/**
	 * Effect to initialize the reader.
	 * Sets up the reading system engine, renderers, and loads the EPUB file.
	 */
	useEffect(() => {
		if (!containerRef.current || !epubUrl) return;
		let destroyed = false;
		
		initializeReader(
			containerRef.current,
			epubUrl,
			setReaderView,
			setCurrentPage,
			setTotalPages,
			setCanGoNext,
			setCanGoPrev
		).then(({ engine, readerView, publication }) => {
			if (destroyed) return;
			engineRef.current = engine;
			readerViewRef.current = readerView;
			publicationRef.current = publication;
		}).catch(console.error);

		return () => {
			destroyed = true;
			engineRef.current?.destroy();
		};
	}, [epubUrl]);

	/**
	 * Effect to update page state and add event listeners.
	 * Ensures the UI reflects the current state of the reader.
	 */
	useEffect(() => {
		if (!readerView) return;

		const updatePageState = () => {
			const timeline = readerView.getPageProgressionTimeline();
			if (!timeline) return;

			const range = timeline.getVisibleTimelineRange();
			setCurrentPage(range.start.pageIndex + 1);
			setTotalPages(timeline.getTotalNumberOfPages());
		};

		updatePageState(); // Initial sync

		const handleVisiblePagesChanged = () => updatePageState();
		const handleCanNext = () => setCanGoNext(readerView.canPerformNext());
		const handleCanPrev = () => setCanGoPrev(readerView.canPerformPrevious());

		readerView.addEngineEventListener('visiblePagesChanged', handleVisiblePagesChanged);
		readerView.addEngineEventListener('canPerformNextChanged', handleCanNext);
		readerView.addEngineEventListener('canPerformPreviousChanged', handleCanPrev);

		// Cleanup event listeners on unmount
		return () => {
			readerView.removeEngineEventListener('visiblePagesChanged', handleVisiblePagesChanged);
			readerView.removeEngineEventListener('canPerformNextChanged', handleCanNext);
			readerView.removeEngineEventListener('canPerformPreviousChanged', handleCanPrev);
		};
	}, [readerView]);


	return (
		<>
			{/* Make the container take up the full viewport */}
			<div 
				ref={containerRef} 
				className="fixed inset-0 w-screen h-screen bg-neutral-100" 
				style={{ 
					width: '100vw',
					height: '100vh',
					position: 'relative',
					padding: 0,
					margin: 0,
					overflow: 'hidden'
				}}
			/>

			{/* Inline navigation bar - keep it at the bottom with z-index to stay above the reader */}
			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-full px-6 py-2 flex items-center gap-4 z-50">
				<button
					onClick={() => {
						console.log('Prev clicked');
						readerViewRef.current?.previous();
					}}
					disabled={!canGoPrev}
					className="text-sm text-gray-900 px-3 py-1 rounded disabled:opacity-30"
				>
					⬅ Prev
				</button>
				<span className="text-xs tabular-nums text-gray-800">
					Page {currentPage ?? '--'} / {totalPages ?? '--'}
				</span>
				<button
					onClick={() => readerViewRef.current?.next()}
					disabled={!canGoNext}
					className="text-sm text-gray-900 px-3 py-1 rounded disabled:opacity-30"
				>
					Next ➡
				</button>
			</div>
		</>
	);
}

/**
 * Initializes the reading system engine and reader view.
 * @param container - The container element for the reader.
 * @param epubUrl - The URL of the EPUB file to load.
 * @param setReaderView - Function to set the reader view state.
 * @param setCurrentPage - Function to set the current page state.
 * @param setTotalPages - Function to set the total pages state.
 * @param setCanGoNext - Function to set the canGoNext state.
 * @param setCanGoPrev - Function to set the canGoPrev state.
 * @returns A promise that resolves with the engine, readerView, and publication.
 */
async function initializeReader(
	container: HTMLDivElement,
	epubUrl: string,
	setReaderView: (view: IReaderView) => void,
	setCurrentPage: (page: number) => void,
	setTotalPages: (total: number) => void,
	setCanGoNext: (canGo: boolean) => void,
	setCanGoPrev: (canGo: boolean) => void
): Promise<{ engine: ReadingSystemEngine, readerView: IReaderView, publication: IReaderPublication }> {

	const engine = new ReadingSystemEngine({
		licenseApiKey: process.env.NEXT_PUBLIC_COLIBRIO_LICENSE_KEY || '',
	});

	engine.addFormatAdapter(new EpubFormatAdapter());

	const readerView = engine.createReaderView({
		// @ts-ignore
		contentDisplayAreaOptions: { 
			type: ContentDisplayAreaType.FILL 
		},
	});

	const scrollRenderer = new SingleDocumentScrollRenderer();
	readerView.addRenderer(
		scrollRenderer,
		() => window.innerWidth < 800
	);

	const flipBookRenderer = new FlipBookRenderer({ 
		animationDurationMs: 500
	});
	readerView.addRenderer(
		flipBookRenderer,
		() => window.innerWidth >= 800
	);

	readerView.setOptions({
		gestureOptions: {
			swipeNavigation: {
				pointerDragThresholdPx: 50,
				pointerTypes: {
					touch: true,
					mouse: true
				}
			}
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			readerView.next();
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			readerView.previous();
		}
	});

	readerView.renderTo(container);

	window.addEventListener('resize', () => {
		readerView.refresh();
	});

	const response = await fetch(epubUrl);
	if (!response.ok) throw new Error('Failed to fetch EPUB');

	const blob = await response.blob();
	const ocfProvider = await EpubOcfResourceProvider.createFromBlob(blob);
	const publication = ocfProvider.getDefaultPublication();
	if (!publication) throw new Error('Failed to load publication');

	const userId = 'demo-user';
	const userToken = userId;
	const publicationToken = publication.getHashSignature();

	const readerPublication = await engine.loadPublication(publication, undefined, {
		userToken,
		publicationToken,
	});

	readerView.setReaderDocuments(readerPublication.getSpine());
	await readerView.goToStart();

	setReaderView(readerView);

	setTimeout(() => {
		const timeline = readerView.getPageProgressionTimeline();
		if (!timeline) return;
		const range = timeline.getVisibleTimelineRange();
		setCurrentPage(range.start.pageIndex + 1);
		setTotalPages(timeline.getTotalNumberOfPages());

		setCanGoNext(readerView.canPerformNext());
		setCanGoPrev(readerView.canPerformPrevious());
	}, 100);

	return { engine, readerView, publication: readerPublication };
}