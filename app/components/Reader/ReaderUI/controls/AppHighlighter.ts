import type { IReaderView, IReaderViewAnnotationLayer, IReaderViewAnnotation, ISelectionChangedEngineEvent } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export class AppHighlighter {
  private readonly annotationLayer: IReaderViewAnnotationLayer;
  private latestSelectionEvent: ISelectionChangedEngineEvent | null = null;
  private readonly annotationToListItemMap: Map<IReaderViewAnnotation, HTMLLIElement> = new Map();
  private readonly createHighlightButton: HTMLElement;
  private readonly highlightListElement: HTMLElement;

  constructor(private readonly readerView: IReaderView, highlightsContainer: HTMLElement) {
    this.annotationLayer = this.readerView.createAnnotationLayer('highlights');
    this.createHighlightButton = highlightsContainer.querySelector('#create-highlight')!;
    this.highlightListElement = highlightsContainer.querySelector('#highlight-list')!;

    // Listen for selection changes
    readerView.addEngineEventListener('selectionChanged', (event: ISelectionChangedEngineEvent) => {
      if (event.isRange) {
        this.latestSelectionEvent = event;
        AppHighlighter.enableButton(this.createHighlightButton);
      } else {
        this.latestSelectionEvent = null;
        AppHighlighter.disableButton(this.createHighlightButton);
      }
    });

    // Listen for highlight creation
    this.createHighlightButton.addEventListener('click', () => this.createHighlight());

    // Listen for annotation visibility changes
    this.annotationLayer.addEngineEventListener('annotationIntersectingVisibleRange', evt => {
      const listItem = this.annotationToListItemMap.get(evt.annotation);
      listItem?.classList.add('highlight-list-item--in-visible-range');
    });
    this.annotationLayer.addEngineEventListener('annotationOutsideVisibleRange', evt => {
      const listItem = this.annotationToListItemMap.get(evt.annotation);
      listItem?.classList.remove('highlight-list-item--in-visible-range');
    });
  }

  private static enableButton(button: HTMLElement): void {
    button.removeAttribute('disabled');
  }

  private static disableButton(button: HTMLElement): void {
    button.setAttribute('disabled', '');
  }

  private createHighlight(): void {
    if (!this.latestSelectionEvent || !this.latestSelectionEvent.contentLocation) return;
    const annotation = this.annotationLayer.createAnnotation(this.latestSelectionEvent.contentLocation, 'highlight');
    this.renderHighlightListItem(annotation, this.latestSelectionEvent.selectionText || '');
    this.latestSelectionEvent = null;
    AppHighlighter.disableButton(this.createHighlightButton);
  }

  private renderHighlightListItem(highlightAnnotation: IReaderViewAnnotation<string>, highlightedText: string): void {
    const listItem = document.createElement('li');
    const link = this.renderLink(AppHighlighter.shortenText(highlightedText, 15), highlightAnnotation.getLocator());
    listItem.appendChild(link);
    listItem.appendChild(this.renderDeleteHighlightButton(highlightAnnotation));
    this.highlightListElement.appendChild(listItem);
    this.annotationToListItemMap.set(highlightAnnotation, listItem);
  }

  private static shortenText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    } else {
      return text;
    }
  }

  private renderLink(text: string | null, locator: any): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = '';
    link.innerText = text ?? '(missing text)';
    if (locator) {
      link.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        this.readerView.goTo(locator).catch(_ => console.log('Failed to go to ' + locator.toString()));
      });
    }
    return link;
  }

  private renderDeleteHighlightButton(highlightAnnotation: IReaderViewAnnotation<string>): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'delete-highlight-button';
    button.innerHTML = '&#9747;'; // X character
    button.addEventListener('click', () => this.deleteHighlight(highlightAnnotation));
    return button;
  }

  private deleteHighlight(highlightAnnotation: IReaderViewAnnotation<string>): void {
    this.annotationLayer.destroyAnnotation(highlightAnnotation);
    const listItem = this.annotationToListItemMap.get(highlightAnnotation);
    if (listItem) {
      listItem.remove();
      this.annotationToListItemMap.delete(highlightAnnotation);
    }
  }
} 