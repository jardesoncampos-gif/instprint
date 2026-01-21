
export interface Filter {
  name: string;
  class: string;
  cssFilter: string;
}

export interface Frame {
  id: string;
  name: string;
  url: string; // Base64 or URL
}

export interface AppState {
  image: string | null;
  selectedFilter: Filter;
  selectedFrame: Frame | null;
  isCameraOpen: boolean;
  isProcessing: boolean;
  aiCaption: string;
}

export const FILTERS: Filter[] = [
  { name: 'Normal', class: 'filter-normal', cssFilter: 'none' },
  { name: 'Clarendon', class: 'filter-clarendon', cssFilter: 'contrast(1.2) saturate(1.35)' },
  { name: 'Gingham', class: 'filter-gingham', cssFilter: 'brightness(1.05) hue-rotate(-10deg)' },
  { name: 'Moon', class: 'filter-moon', cssFilter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { name: 'Lark', class: 'filter-lark', cssFilter: 'brightness(1.08) contrast(1.1) saturate(1.2)' },
  { name: 'Reyes', class: 'filter-reyes', cssFilter: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' },
  { name: 'Juno', class: 'filter-juno', cssFilter: 'sepia(0.15) contrast(1.1) saturate(1.5) hue-rotate(-10deg)' },
  { name: 'Slumber', class: 'filter-slumber', cssFilter: 'brightness(1.05) saturate(0.66) sepia(0.35)' },
  { name: 'Aden', class: 'filter-aden', cssFilter: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)' },
  { name: 'Ludwig', class: 'filter-ludwig', cssFilter: 'brightness(1.05) contrast(1.05) saturate(1.1) sepia(0.1)' }
];

export const FRAMES: Frame[] = [
  { id: 'none', name: 'Nenhuma', url: '' },
  { id: 'polaroid', name: 'Polaroid', url: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L3BkbWlzY2VsbGFuZW91czMtcHJpbnRfYXJ0XzMtcG5nLnBuZw.png' },
  { id: 'classic-white', name: 'Borda Branca', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6ca76AAAAA1BMVEUAAP79f+LBAAAALElEQVR42u3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8BswAAAB69X87AAAAABJRU5ErkJggg==' },
  { id: 'film', name: 'Filme', url: 'https://www.transparentpng.com/download/film-strip/film-strip-png-transparent-17.png' }
];
