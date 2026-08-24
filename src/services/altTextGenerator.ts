import type { PdfElement } from '../types/pdf';

export interface AltTextGenerationOptions {
  mode: 'concise' | 'detailed' | 'academic';
  includeContext: boolean;
}

export function generateAiAltText(
  element: PdfElement,
  contextElements: PdfElement[] = [],
  options: AltTextGenerationOptions = { mode: 'detailed', includeContext: true }
): string {
  // Find surrounding heading or chapter
  const nearbyHeading = contextElements
    .filter((el) => el.pageNumber === element.pageNumber && el.tag.startsWith('H'))
    .sort((a, b) => Math.abs(a.readingOrder - element.readingOrder) - Math.abs(b.readingOrder - element.readingOrder))[0];

  const nearbyCaption = contextElements
    .filter((el) => el.pageNumber === element.pageNumber && el.tag === 'Caption')
    .sort((a, b) => Math.abs(a.readingOrder - element.readingOrder) - Math.abs(b.readingOrder - element.readingOrder))[0];

  const headingContext = nearbyHeading ? `in section "${nearbyHeading.text}"` : '';
  const captionContext = nearbyCaption ? ` (captioned "${nearbyCaption.text}")` : '';

  // Heuristic synthesis based on element text / detected type
  const textLower = (element.text || '').toLowerCase();

  if (textLower.includes('flowchart') || textLower.includes('transformation') || textLower.includes('architecture')) {
    if (options.mode === 'concise') {
      return 'Flowchart illustrating the three-stage transition from visual PDF coordinates to a semantic PDF/UA tree and audio output.';
    }
    return `Flowchart ${headingContext}${captionContext} depicting a sequential three-box workflow: Box 1 represents raw visual PDF coordinate inputs, Box 2 represents the semantic layout classifier and reading order engine, and Box 3 shows the exported PDF/UA tagged tree generating accessible audio synthesis.`;
  }

  if (textLower.includes('chart') || textLower.includes('graph') || textLower.includes('trend')) {
    return `Data chart ${headingContext} showing comparative metrics across multiple categories with ascending progression.`;
  }

  if (textLower.includes('emblem') || textLower.includes('logo') || textLower.includes('band') || textLower.includes('decoration')) {
    return 'Decorative insignia representing the publisher imprint and section division.';
  }

  if (textLower.includes('cover') || textLower.includes('book')) {
    return `Book cover illustration ${headingContext} featuring modern geometric motifs and high-contrast typography.`;
  }

  // General fallback
  if (element.text && element.text.length > 10) {
    return `Visual figure depicting ${element.text.replace(/^\[|\]$/g, '').trim()} ${headingContext}.`;
  }

  return `Informative illustration ${headingContext} supporting the discussion of digital document structure.`;
}
