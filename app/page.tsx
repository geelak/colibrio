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
	EpubFormatAdapter,
	IEpubReaderPublicationOptions,
	EpubRemoteResourcePolicyType,
	IEpubRemoteResourceOptions,
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-formatadapter-epub';

import {
	EpubOcfResourceProvider,
} from '@colibrio/colibrio-reader-framework/colibrio-core-publication-epub';

import {
	StackRenderer,
	FlipBookRenderer,
	SinglePageSwipeRenderer,
	SingleDocumentScrollRenderer,
	SpreadSwipeRenderer,
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-renderer';

import {
	IReaderPublication,
	IReaderPublicationOptions,
	IReaderView,
	// @ts-ignore
	ContentDisplayAreaType
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

import {
	WebSpeechTtsSynthesizer
} from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-engine';

// Import the new CollapsibleUIBar component
import CollapsibleUIBar from './old/CollapsibleUIBar';

// Update imports to use new component structure
import UIBar from '@/components/Reader/ReaderUI/UIBar';
import Content from '@/components/Reader/ReaderContent/Content';
import TableOfContents from '@/components/Reader/ReaderUI/TableOfContents';

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
	const [epubFile, setEpubFile] = useState<File | null>(null);
	const [showTOC, setShowTOC] = useState(false);

	// TTS/Audio state
	const [ttsPlayer, setTtsPlayer] = useState<any>(null);
	const [ttsState, setTtsState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
	const [ttsVoices, setTtsVoices] = useState<{ label: string; value: string }[]>([]);
	const [ttsVoice, setTtsVoice] = useState<string | undefined>(undefined);
	const [ttsSpeed, setTtsSpeed] = useState<number>(1);

	// Add a ref to track browser TTS paused state
	const browserTtsPausedRef = useRef(false);

	// Get search parameters from context
	const searchParams = useSearchParamsContext();

	// Handle file input change
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setEpubFile(file);
			setEpubUrl(null); // Clear URL if using file
		}
	};

	/**
	 * Effect to set the EPUB URL from search parameters.
	 * This will be used to load the EPUB file into the reader.
	 */
	useEffect(() => {
		if (!epubFile) {
			const epub = searchParams.get('epub');
			setEpubUrl(epub || '/demo/demo.epub');
		}
	}, [searchParams, epubFile]);

	/**
	 * Effect to initialize the reader.
	 * Sets up the reading system engine, renderers, and loads the EPUB file.
	 */
	useEffect(() => {
		if (!containerRef.current || (!epubUrl && !epubFile)) return;
		let destroyed = false;

		// Create an instance of ReaderInitializer
		const readerInitializer = new ReaderInitializer(
			containerRef.current,
			epubUrl,
			epubFile,
			setReaderView,
			setCurrentPage,
			setTotalPages,
			setCanGoNext,
			setCanGoPrev,
			setTtsPlayer
		);

		// Call renderEpub method
		readerInitializer.renderEpub().then(({ engine, readerView, publication }) => {
			if (destroyed) return;
			engineRef.current = engine;
			readerViewRef.current = readerView;
			publicationRef.current = publication;
		}).catch(console.error);

		return () => {
			destroyed = true;
			engineRef.current?.destroy();
		};
	}, [epubUrl, epubFile]);

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

			// Add logging for active renderer
			console.log('Active Renderer:', readerView.getActiveRenderer()?.getName());
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

	useEffect(() => {
		if (ttsPlayer && ttsPlayer.addEventListener) {
			ttsPlayer.addEventListener('play', () => setTtsState('playing'));
			ttsPlayer.addEventListener('pause', () => setTtsState('paused'));
			ttsPlayer.addEventListener('stop', () => setTtsState('stopped'));
		}
	}, [ttsPlayer]);

	// Populate TTS voices from browser
	useEffect(() => {
		function updateVoices() {
			const voices = window.speechSynthesis?.getVoices?.() || [];
			const formatted = voices.map(v => ({ label: v.name + (v.lang ? ` (${v.lang})` : ''), value: v.name }));
			setTtsVoices(formatted);
			if (!ttsVoice && formatted.length > 0) setTtsVoice(formatted[0].value);
		}
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = updateVoices;
			updateVoices();
		}
	}, []);

	// Helper: get selected text from visible iframe(s) or window
	function getSelectedText() {
		const container = containerRef.current;
		if (container) {
			const iframes = container.querySelectorAll('iframe');
			for (let i = 0; i < iframes.length; i++) {
				const iframe = iframes[i];
				try {
					const sel = iframe.contentWindow?.getSelection?.();
					if (sel && sel.toString().trim()) return sel.toString();
				} catch {}
			}
		}
		if (typeof window !== 'undefined') {
			const sel = window.getSelection?.();
			if (sel && sel.toString().trim()) return sel.toString();
		}
		return '';
	}

	// Helper: get visible page text from visible iframe(s)
	async function getVisiblePageText() {
		const container = containerRef.current;
		if (container) {
			const iframes = container.querySelectorAll('iframe');
			let text = '';
			for (let i = 0; i < iframes.length; i++) {
				const iframe = iframes[i];
				try {
					const doc = iframe.contentDocument;
					if (doc && doc.body) text += doc.body.innerText + '\n';
				} catch {}
			}
			if (text.trim()) return text.trim();
		}
		return '';
	}

	// Updated handleTTSPlay
	const handleTTSPlay = async () => {
		if (ttsState === 'paused') {
			// Resume
			if (ttsPlayer && ttsPlayer.resume) {
				ttsPlayer.resume();
			} else if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.resume();
				browserTtsPausedRef.current = false;
			}
			setTtsState('playing');
			return;
		}
		// Start reading as before
		let text = getSelectedText();
		if (!text) text = await getVisiblePageText();
		if (!text) {
			alert('No text found to read.');
			return;
		}
		if (ttsPlayer && ttsPlayer.speak) {
			if (ttsPlayer.setVoice && ttsVoice) ttsPlayer.setVoice(ttsVoice);
			if (ttsPlayer.setSpeed) ttsPlayer.setSpeed(ttsSpeed);
			ttsPlayer.speak(text);
			setTtsState('playing');
		} else if (typeof window !== 'undefined' && window.speechSynthesis) {
			const utter = new window.SpeechSynthesisUtterance(text);
			const voices = window.speechSynthesis.getVoices();
			if (ttsVoice) utter.voice = voices.find(v => v.name === ttsVoice) || null;
			utter.rate = ttsSpeed;
			utter.onend = () => setTtsState('stopped');
			utter.onpause = () => setTtsState('paused');
			utter.onresume = () => setTtsState('playing');
			window.speechSynthesis.cancel();
			window.speechSynthesis.speak(utter);
			browserTtsPausedRef.current = false;
			setTtsState('playing');
		}
	};

	const handleTTSPause = () => {
		if (ttsPlayer && ttsPlayer.pause) {
			ttsPlayer.pause();
			setTtsState('paused');
		} else if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.pause();
			browserTtsPausedRef.current = true;
			setTtsState('paused');
		}
	};

	const handleTTSStop = () => {
		if (ttsPlayer && ttsPlayer.stop) {
			ttsPlayer.stop();
			setTtsState('stopped');
		} else if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.cancel();
			browserTtsPausedRef.current = false;
			setTtsState('stopped');
		}
	};

	const handleTTSNext = () => {
		if (ttsPlayer && ttsPlayer.next) {
			ttsPlayer.next();
			setTtsState('playing');
		} else {
			alert('Next is not supported for browser TTS.');
		}
	};

	const handleTTSPrev = () => {
		if (ttsPlayer && ttsPlayer.previous) {
			ttsPlayer.previous();
			setTtsState('playing');
		} else {
			alert('Previous is not supported for browser TTS.');
		}
	};

	const handleVoiceChange = (voice: string) => {
		setTtsVoice(voice);
		if (ttsPlayer?.setVoice) ttsPlayer.setVoice(voice);
	};
	const handleSpeedChange = (speed: number) => {
		setTtsSpeed(speed);
		if (ttsPlayer?.setSpeed) ttsPlayer.setSpeed(speed);
	};

	const ttsSupportsNextPrev = !!ttsPlayer?.next && !!ttsPlayer?.previous;

	return (
		<>
			{/* File input for local EPUB */}
			<div style={{ padding: '1rem' }}>
				<label htmlFor="file-select-input">Load local EPUB: </label>
				<input
					id="file-select-input"
					type="file"
					accept="application/epub+zip,.epub"
					onChange={handleFileChange}
				/>
			</div>
			<Content
				ref={containerRef}
				readerViewRef={readerViewRef}
			/>
			<UIBar
				currentPage={currentPage}
				totalPages={totalPages}
				canGoNext={canGoNext}
				canGoPrev={canGoPrev}
				readerViewRef={readerViewRef}
				onTOCClick={() => setShowTOC(true)}
				onTTSPlay={handleTTSPlay}
				onTTSPause={handleTTSPause}
				onTTSStop={handleTTSStop}
				onTTSPrev={handleTTSPrev}
				onTTSNext={handleTTSNext}
				ttsVoices={ttsVoices}
				ttsVoice={ttsVoice}
				onVoiceChange={handleVoiceChange}
				ttsSpeed={ttsSpeed}
				onSpeedChange={handleSpeedChange}
				ttsState={ttsState}
				ttsSupportsNextPrev={ttsSupportsNextPrev}
			/>
			{showTOC && (
				<TableOfContents
					readerPublication={publicationRef.current}
					readerView={readerViewRef.current}
					onClose={() => setShowTOC(false)}
				/>
			)}
		</>
	);
}

/**
 * Class responsible for initializing and rendering EPUB and Audiobook content.
 */
class ReaderInitializer {
	private engine: ReadingSystemEngine;
	private readerView: IReaderView | null = null;
	private publication: IReaderPublication | null = null;
	private epubPublication: any = null; // Store the original EPUB publication
	private container: HTMLDivElement;
	private epubUrl: string;
	private epubFile: File | null;
	private setReaderView: (view: IReaderView) => void;
	private setCurrentPage: (page: number) => void;
	private setTotalPages: (total: number) => void;
	private setCanGoNext: (canGo: boolean) => void;
	private setCanGoPrev: (canGo: boolean) => void;
	private setTtsPlayer?: (player: any) => void;

	// Updated metadata type definition
	private metadata: {
		layout?: string;        // 'fixed' or 'reflowable'
		direction?: string;     // 'rtl' or 'ltr'
		title?: string;
		creator?: string;
		language?: string;
		spine?: any;
		metadata?: any;
	} = {};

	constructor(
		container: HTMLDivElement,
		epubUrl: string | null,
		epubFile: File | null,
		setReaderView: (view: IReaderView) => void,
		setCurrentPage: (page: number) => void,
		setTotalPages: (total: number) => void,
		setCanGoNext: (canGo: boolean) => void,
		setCanGoPrev: (canGo: boolean) => void,
		setTtsPlayer?: (player: any) => void
	) {
		this.container = container;
		this.epubUrl = epubUrl || '';
		this.epubFile = epubFile || null;
		this.setReaderView = setReaderView;
		this.setCurrentPage = setCurrentPage;
		this.setTotalPages = setTotalPages;
		this.setCanGoNext = setCanGoNext;
		this.setCanGoPrev = setCanGoPrev;
		this.setTtsPlayer = setTtsPlayer;

		this.engine = new ReadingSystemEngine({
			licenseApiKey: process.env.NEXT_PUBLIC_COLIBRIO_LICENSE_KEY || '',
		});
		this.engine.addFormatAdapter(new EpubFormatAdapter());
	}

	/**
	 * Initializes and renders the EPUB content.
	 */
	async renderEpub(): Promise<{ engine: ReadingSystemEngine, readerView: IReaderView, publication: IReaderPublication }> {
		// First, load the EPUB to analyze its metadata
		await this.loadEpubFile();

		// Process the metadata
		this.processMetadata();

		// Then set up the reader view based on the publication's metadata
		this.setupReaderView();

		// Configure renderer options based on metadata
		this.configureRendererOptions();

		// Render to DOM
		this.renderToDOM();

		// Finally, load the publication into the reader
		await this.loadEpubIntoReader();

		console.log('Metadata:', this.metadata);

		return {
			engine: this.engine,
			readerView: this.readerView!,
			publication: this.publication!
		};
	}

	/**
	 * Loads the EPUB file and extracts metadata.
	 */
	private async loadEpubFile(): Promise<void> {
		try {
			let blob: Blob;
			if (this.epubFile) {
				blob = this.epubFile;
			} else {
				const response = await fetch(this.epubUrl);
				if (!response.ok) throw new Error('Failed to fetch EPUB');
				blob = await response.blob();
			}
			const ocfProvider = await EpubOcfResourceProvider.createFromBlob(blob);
			this.epubPublication = ocfProvider.getDefaultPublication();
			if (!this.epubPublication) throw new Error('Failed to load publication');
		} catch (error) {
			console.error('Error loading EPUB file:', error);
			throw error;
		}
	}

	/**
	 * Process and store metadata from the publication.
	 */
	private processMetadata(): void {
		if (!this.epubPublication) return;

		try {
			// Extract metadata that might influence reader configuration
			const metadata = this.epubPublication.getMetadata();
			const layout = this.epubPublication.getDefaultLayout();
			const direction = this.epubPublication.getPageProgressionDirection();

			// Get spine metadata and items from package document
			const spine = this.epubPublication.packageDocument?.spine || {};
			const spineItems = this.epubPublication.getSpine() || [];

			// Store in the metadata property
			this.metadata = {
				layout,
				direction,
				metadata,
				spine,
			};
		} catch (error) {
			console.error('Error processing metadata:', error);
		}
	}

	/**
	 * Logs comprehensive rendering metadata from EPUB publication
	 * @param epubPublication The EPUB publication to log metadata for
	 * @param visiblePageIndices Optional array of spine indices for currently visible pages
	 */
	private logRenderingMetadata(epubPublication: any, visiblePageIndices: number[] = []): void {
		console.log('Building metadata table...', visiblePageIndices.length ?
			`Focusing on spine indices: ${visiblePageIndices.join(', ')}` : 'Showing all pages');
		console.groupCollapsed('%c📘 EPUB Rendering Metadata', 'color: cyan; font-weight: bold');

		try {
			// 1. Publication-level metadata
			const meta = epubPublication.getMetadata();
			const layout = epubPublication.getDefaultLayout?.(); // fallback if not available
			const orientation = epubPublication.getPreferredOrientation?.();
			const spread = epubPublication.getPreferredSyntheticSpreadBehavior?.();
			const flowMode = epubPublication.getPreferredFlowMode?.();
			const direction = epubPublication.getPageProgressionDirection?.();

			console.log('📄 Publication-Level Metadata');
			console.table({
				layout,
				orientation,
				spread,
				flowMode,
				pageProgressionDirection: direction,
				rawMetadata: meta
			});

			// 2. Spine items
			// const spineItems = epubPublication.getSpine?.();
			// if (spineItems) {
			// 	console.groupCollapsed('📚 Spine Items');

			// 	// If we have visible page indices, highlight those items
			// 	if (visiblePageIndices.length > 0) {
			// 		console.log('%c📌 Currently Visible Pages:', 'color: green; font-weight: bold');

			// 		// First log the visible pages with more details
			// 		visiblePageIndices.forEach((index: number) => {
			// 			if (index >= 0 && index < spineItems.length) {
			// 				const item = spineItems[index];
			// 				const href = item.getContentUrl?.()?.href || item.href;
			// 				const layout = item.getLayout?.();
			// 				const spread = item.getSyntheticSpreadBehavior?.();
			// 				const scripted = item.isScripted?.();
			// 				const hasRemote = item.hasRemoteResources?.();
			// 				const linear = item.isInLinearContent?.();
			// 				const pageSlot = item.getPageSpreadSlot?.();
			// 				const mediaType = item.getMediaType?.();

			// 				let propertiesAttr = undefined;
			// 				let manifestAttrs = undefined;
			// 				let itemrefAttrs = undefined;

			// 				try {
			// 					propertiesAttr = item.getOpfSpineItemElement?.()?.getAttribute('properties');
			// 					manifestAttrs = item.getOpfManifestItemElement?.()?.attributes;
			// 					itemrefAttrs = item.getOpfSpineItemElement?.()?.attributes;
			// 				} catch (err) {
			// 					console.warn('Raw OPF access error on item', index, err);
			// 				}

			// 				console.log(`%c🔸 Visible Spine #${index}: ${href}`, 'color: green; font-weight: bold');
			// 				console.table({
			// 					layout,
			// 					spread,
			// 					linear,
			// 					pageSlot,
			// 					scripted,
			// 					hasRemote,
			// 					mediaType,
			// 					propertiesAttr,
			// 					manifestAttrs,
			// 					itemrefAttrs,
			// 				});
			// 			} else {
			// 				console.warn(`Invalid spine index: ${index}`);
			// 			}
			// 		});
			// 	}

			// 	// Then log all spine items (or just summarize if too many)
			// 	if (spineItems.length > 20 && !visiblePageIndices.length) {
			// 		console.log(`Total spine items: ${spineItems.length} (Too many to display all, showing only visible or first few)`);
			// 		// Show first few items for reference
			// 		for (let i = 0; i < 3; i++) {
			// 			if (i < spineItems.length) {
			// 				const item = spineItems[i];
			// 				const href = item.getContentUrl?.()?.href || item.href;
			// 				console.log(`🔹 Spine #${i}: ${href}`);
			// 			}
			// 		}
			// 	} else {
			// 		// Show all items or at least the non-visible ones more concisely
			// 		spineItems.forEach((item: any, index: number) => {
			// 			// Skip detailed logging for items we already showed above
			// 			if (visiblePageIndices.includes(index)) {
			// 				return;
			// 			}

			// 			const href = item.getContentUrl?.()?.href || item.href;
			// 			const layout = item.getLayout?.();
			// 			const spread = item.getSyntheticSpreadBehavior?.();

			// 			console.log(`🔹 Spine #${index}: ${href}`);
			// 			console.table({
			// 				layout,
			// 				spread,
			// 			});
			// 		});
			// 	}
			// 	console.groupEnd();
			// }

			// 3. Raw OPF dump
			// try {
			// 	const opf = epubPublication.getOpfDocument?.();
			// 	if (opf) {
			// 		console.groupCollapsed('📦 Raw OPF Document');
			// 		console.log(opf);
			// 		console.groupEnd();
			// 	}
			// } catch (err) {
			// 	console.warn('Could not access OPF document:', err);
			// }
		} catch (err) {
			console.error('Error during EPUB metadata diagnostics:', err);
		}

		console.groupEnd();
	}

	/**
	 * Sets up the reader view with renderers.
	 */
	private setupReaderView(): void {
		// Create reader view with options potentially influenced by metadata
		this.readerView = this.engine.createReaderView({
			contentDisplayAreaOptions: {
				type: ContentDisplayAreaType.FILL
			},
		});

		// Initialize all available renderers
		const scrollRenderer = new SingleDocumentScrollRenderer();
		const flipBookRenderer = new FlipBookRenderer({ animationDurationMs: 500, hideEmptySpreadSlots: true });
		const stackRenderer = new StackRenderer();
		const singlePageSwipeRenderer = new SinglePageSwipeRenderer();
		const spreadSwipeRenderer = new SpreadSwipeRenderer();

		// Add all renderers with () => false to let the reader choose based on EPUB specs
		this.readerView.addRenderer(scrollRenderer, '(max-width: 648px)');
		this.readerView.addRenderer(spreadSwipeRenderer, '(min-width: 648px)');
		// this.readerView.addRenderer(flipBookRenderer, '(min-width: 648px)');
		// this.readerView.addRenderer(stackRenderer, '(min-width: 648px)');
		// this.readerView.addRenderer(singlePageSwipeRenderer, '(min-width: 648px)');

		// Add keyboard navigation
		document.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
				this.readerView?.next();
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
				this.readerView?.previous();
			}
		});
	}

	/**
	 * Configure renderer options based on metadata.
	 */
	private configureRendererOptions(): void {
		if (!this.readerView) return;

		// Configure gesture options
		const gestureOptions = {
			swipeNavigation: {
				pointerDragThresholdPx: 50,
				pointerTypes: {
					touch: true,
					mouse: true
				}
			}
		};

		// Apply the options
		this.readerView.setOptions({
			gestureOptions
		});
	}

	/**
	 * Loads the EPUB content into the reader.
	 */
	private async loadEpubIntoReader(): Promise<void> {
		try {
			if (!this.epubPublication) {
				throw new Error('EPUB publication not loaded');
			}

			const userId = 'demo-user';
			const userToken = userId;
			const publicationToken = this.epubPublication.getHashSignature();

			// Test with a simpler CSS structure
			const cssRules = this.getCustomCss();
			console.log('CSS Rules to be injected:', cssRules);

			const epubPublicationOptions: IEpubReaderPublicationOptions = {
				allowDocumentScripting: true,
				remoteResourcesNonScriptedDocumentsOptions: {
					policyType: EpubRemoteResourcePolicyType.ALLOW_ALL,
				},
				remoteResourcesScriptedDocumentsOptions: {
					policyType: EpubRemoteResourcePolicyType.ALLOW_ALL,
				},
				customPublicationCss: {
					injectionPointStart: cssRules,
					injectionPointEnd: cssRules
				},
				enableMediaStreaming: true,
			};

			console.log('Full publication options:', epubPublicationOptions);

			const publication = await this.engine.loadPublication(
				this.epubPublication,
				epubPublicationOptions,
				{ userToken, publicationToken }
			);

			console.log('Publication loaded, checking if CSS was applied');

			this.publication = publication;
			this.readerView?.setReaderDocuments(publication.getSpine());
			await this.readerView?.goToStart();


			this.setReaderView(this.readerView!);

			// === Legible annotation layer & audio/TTS bootstrap ===
			try {
			  const layerName = "legible-layer";
			  let layer = this.readerView!.getAnnotationLayerByName(layerName);
			  if (!layer) {
			    layer = this.readerView!.createAnnotationLayer(layerName, {
			      zIndex: 5,
			      layerStyle: { pointerEvents: "none", mixBlendMode: "multiply" },
			    });
			    this.readerView!.setAnnotationLayerVisible(layer, true);
			  }

			  // Set default annotation appearance
			  layer.setDefaultAnnotationOptions({
			    containerClassName: "legible-annotation",
			    rangeStyle: {
			      backgroundColor: "rgba(128, 0, 255, 0.2)",
			      borderRadius: "0.25rem",
			      pointerEvents: "auto",
			      cursor: "pointer",
			    },
			  });

			  // Add highlight for current visible locator + 3 ToC items
			  const visibleLoc = await this.readerView!.getVisibleLocator();
			  const nav = this.publication!.getTableOfContents();
			  const firstThree = nav.slice(0, 3).map((item) => item.getLocator());
			  layer.createAnnotations([visibleLoc, ...firstThree]);

			  // Interactivity
			  for (const ann of layer.getAnnotations()) {
			    ann.setOptions({
			      onClick: () => {
			        const loc = ann.getLocator();
			        this.readerView!.goToLocator(loc);
			        console.log("Clicked annotation for", loc.href);
			      },
			    });
			  }

			  // Audio / TTS setup
			  try {
			    const timeline = await this.engine.loadSyncMediaTimeline("/demo/media-overlay.json");
			    const player = this.engine.createSyncMediaPlayer({ name: "voice", timeline });
			    this.readerView!.setSyncMediaPlayer(player);
			    player.play(); // autoplay for demo
			    if (this.setTtsPlayer) this.setTtsPlayer(player);
			  } catch {
			    const synth = new WebSpeechTtsSynthesizer({ lang: "en-US" });
			    this.readerView!.setTtsSynthesizer(synth);
			    if (this.setTtsPlayer) this.setTtsPlayer(synth);
			  }

			  // Refresh annotations on page change
			  this.readerView!.addEngineEventListener("visiblePagesChanged", () => {
			    const layer = this.readerView!.getAnnotationLayerByName("legible-layer");
			    if (layer) layer.refreshAnnotations();
			  });
			} catch (err) {
			  console.error("Annotation / audio bootstrap failed:", err);
			}

			setTimeout(() => {
				const timeline = this.readerView?.getPageProgressionTimeline();
				if (!timeline) return;

				// Get the current page and total pages
				const range = timeline.getVisibleTimelineRange();
				this.setCurrentPage(range.start.pageIndex + 1);
				this.setTotalPages(timeline.getTotalNumberOfPages());

				// Check navigation capabilities
				this.setCanGoNext(this.readerView!.canPerformNext());
				this.setCanGoPrev(this.readerView!.canPerformPrevious());

				// Log API method names for debugging
				console.log('Available timeline methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(timeline)));
			}, 100);

			// After loading, verify CSS application
			console.log('Publication loaded, CSS should be applied');
		} catch (error) {
			console.error('Error loading EPUB into reader:', error);
			throw error;
		}
	}

	/**
	 * Generate custom CSS based on metadata.
	 */
	private getCustomCss(): string[] {
		return [
			'div[role="document"] { width: 100% !important; height: 100% !important; }',
			'.colibrio-renderer-runtime-container { width: 100% !important; height: 100% !important; }',
			'body.colibrio-reflowable-content { column-count: 1 !important; overflow-y: auto !important; }',
			'.colibrio-renderer-scrolled-document { overflow-y: auto !important; height: 100% !important; }',
			'.colibrio-content-document { column-count: 1 !important; column-width: auto !important; }',
		];
	}

	/**
	 * Renders the reader view to the DOM.
	 */
	private renderToDOM(): void {

		if (this.readerView) {
			this.readerView.renderTo(this.container);

			const setIframeScrolling = () => {
				const iframes = this.container.querySelectorAll('iframe');
				if (iframes.length) {
					iframes.forEach(iframe => {
						iframe.setAttribute('scrolling', 'yes');
						iframe.style.overflowY = 'auto';
						(iframe.style as any).webkitOverflowScrolling = 'touch';
						iframe.style.touchAction = 'manipulation';
						iframe.style.pointerEvents = 'auto';
					});
				}
			}

			// Initial call to set the iframe scrolling
			setIframeScrolling();

			// Log the active renderer initially
			console.log('Initial Active Renderer:', this.readerView.getActiveRenderer()?.getName());

			// Add a debug message before calling the function
			console.log('Calling initial metadata logging...');
			// Call the comprehensive metadata logging function
			this.logRenderingMetadata(this.epubPublication, []);

			// Store a reference to 'this' to ensure we have the correct context
			const self = this;

			window.addEventListener('resize', function () {
				console.log('Resize event triggered');

				if (self.readerView) {
					self.readerView.refresh();

					// Log the active renderer after resize
					console.log('Active Renderer after resize:', self.readerView.getActiveRenderer()?.getName());

					// Add a debug message before calling the function
					console.log('Attempting to call metadata logging from resize event...');

					// Explicitly check if the logging function exists
					if (typeof self.logRenderingMetadata === 'function') {
						// Call with explicit this binding
						self.logRenderingMetadata.call(self, self.epubPublication, []);
					} else {
						console.error('logRenderingMetadata is not a function:', self.logRenderingMetadata);
					}

					// Ensure iframe scrolling attribute remains set after refresh
					setIframeScrolling();
				} else {
					console.error('readerView is null during resize event');
				}
			});

			// Add a visiblePagesChanged event listener to log metadata when pages change
			if (this.readerView) {
				this.readerView.addEngineEventListener('visiblePagesChanged', () => {
					console.log('Page changed, logging metadata...');
					let pageIndices: number[] = []; // Explicitly type as number array
					// Method 2: Using visible ReaderDocument
					const visibleDocs = this.readerView!.getVisibleReaderDocuments();
					if (visibleDocs.length === 0) {
						console.log("No visible documents detected");
					} else if (visibleDocs.length === 1) {
						const currentDoc = visibleDocs[0];    // the first visible document
						const spineIndex = currentDoc.getIndexInSpine();
						pageIndices.push(spineIndex);
						console.log("Current spine index:", spineIndex);
					} else if (visibleDocs.length > 1) {
						console.log('Spread view detected:', visibleDocs.length);
						// Collect all spine indices for visible documents
						visibleDocs.forEach(doc => {
							const spineIndex = doc.getIndexInSpine();
							pageIndices.push(spineIndex);
						});
						console.log("Visible spine indices:", pageIndices);
					}

					this.logRenderingMetadata(this.epubPublication, pageIndices);

					// Ensure iframe scrolling attribute remains set after refresh
					setIframeScrolling();
				});
			}
		}
	}

	/**
	 * Renders Audiobook content (stub for future implementation).
	 */
	async renderAudiobook(): Promise<void> {
		console.log('Audiobook rendering is not yet implemented.');
		await this.loadAudiobook();
	}

	/**
	 * Loads Audiobook content (stub for future implementation).
	 */
	private async loadAudiobook(): Promise<void> {
		console.log('Audiobook loading is not yet implemented.');
	}
}

