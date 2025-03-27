'use client';

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

import { 
	useSearchParamsContext 
} from './contexts/SearchParamsProvider';

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
	//ContentDisplayAreaType,
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export const dynamic = 'force-dynamic';

export default function DemoReaderPage() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const engineRef = useRef<ReadingSystemEngine>(null);
	const readerViewRef = useRef<IReaderView>(null);
	const publicationRef = useRef<IReaderPublication>(null);

	const [currentPage, setCurrentPage] = useState<number>();
	const [totalPages, setTotalPages] = useState<number>();
	const [canGoNext, setCanGoNext] = useState(true);
	const [canGoPrev, setCanGoPrev] = useState(false);
	const [readerView, setReaderView] = useState<IReaderView | null>(null);
	const [epubUrl, setEpubUrl] = useState<string | null>(null);

	const searchParams = useSearchParamsContext();

	useEffect(() => {
		const epub = searchParams.get('epub');
		setEpubUrl(epub || '/demo/demo.epub');
	}, [searchParams]);

	useEffect(() => {
		if (!containerRef.current || !epubUrl) return;
		let destroyed = false;
		
		const init = async () => {

			const engine = new ReadingSystemEngine({
				licenseApiKey: process.env.NEXT_PUBLIC_COLIBRIO_LICENSE_KEY || '',
			});

			engine.addFormatAdapter(new EpubFormatAdapter());

			const readerView = engine.createReaderView({
				// contentDisplayAreaOptions: { 
				// 	type: ContentDisplayAreaType.FILL 
				// },
			});

			// Set up renderers
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

			// Configure gesture options for the reader view
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

			// Add keyboard navigation
			document.addEventListener('keydown', (event) => {
				if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
					readerView.next();
				} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
					readerView.previous();
				}
			});

			readerView.renderTo(containerRef.current!);

			// Refresh layout on resize
			window.addEventListener('resize', () => {
				readerView.refresh();
			});

			engineRef.current = engine;
			readerViewRef.current = readerView;
			setReaderView(readerView);

			const response = await fetch(epubUrl);
			if (!response.ok || destroyed) return;

			const blob = await response.blob();
			if (destroyed) return;

			const ocfProvider = await EpubOcfResourceProvider.createFromBlob(blob);
			if (destroyed) return;

			const publication = ocfProvider.getDefaultPublication();
			if (!publication || destroyed) return;

			const userId = 'demo-user';
			const userToken = userId;
			const publicationToken = publication.getHashSignature();

			const readerPublication = await engine.loadPublication(publication, undefined, {
				userToken,
				publicationToken,
			});
			if (destroyed) return;

			publicationRef.current = readerPublication;

			readerView.setReaderDocuments(readerPublication.getSpine());

			await readerView.goToStart();

			// Ensure state sync (after a short timeout)
			setTimeout(() => {
				const timeline = readerView.getPageProgressionTimeline();
				if (!timeline) return;
				const range = timeline.getVisibleTimelineRange();
				setCurrentPage(range.start.pageIndex + 1);
				setTotalPages(timeline.getTotalNumberOfPages());

				setCanGoNext(readerView.canPerformNext());
				setCanGoPrev(readerView.canPerformPrevious());
			}, 100);

			// Navigation events
			const timeline = readerView.getPageProgressionTimeline();
			if (!timeline) return;

			readerView.addEngineEventListener('visiblePagesChanged', () => {
				const timeline = readerView.getPageProgressionTimeline();
				if (!timeline) return;

				const range = timeline.getVisibleTimelineRange();
				console.log('Visible pages changed:', range.start.pageIndex, range.end.pageIndex);
				setCurrentPage(range.start.pageIndex + 1);
				setTotalPages(timeline.getTotalNumberOfPages());
			});

			readerView.addEngineEventListener('canPerformNextChanged', () => {
				setCanGoNext(readerView.canPerformNext());
			});

			readerView.addEngineEventListener('canPerformPreviousChanged', () => {
				setCanGoPrev(readerView.canPerformPrevious());
			});
		};

		init();

		return () => {
			destroyed = true;
			engineRef.current?.destroy();
		};
	}, [epubUrl]);

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

		// Cleanup
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
