import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

type PdfDoc = pdfjsLib.PDFDocumentProxy;

interface CachedDoc {
  buffer: ArrayBuffer;
  promise: Promise<PdfDoc>;
}

const docsById = new Map<string, CachedDoc>();

const PAGE_CACHE_LIMIT = 10;
const pageBitmaps = new Map<string, ImageBitmap>();
const pageOrder: string[] = [];

export function primePdfDocument(id: string, buffer: ArrayBuffer, doc: PdfDoc): void {
  docsById.set(id, { buffer, promise: Promise.resolve(doc) });
}

export function getPdfDocument(id: string, buffer: ArrayBuffer): Promise<PdfDoc> {
  const hit = docsById.get(id);
  if (hit && hit.buffer === buffer) {
    return hit.promise;
  }

  const data = new Uint8Array(buffer.slice(0));
  const promise = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  }).promise;

  docsById.set(id, { buffer, promise });
  return promise;
}

function pageKey(docId: string, page: number, cssWidth: number, dpr: number): string {
  return `${docId}:${page}:${Math.round(cssWidth)}:${dpr.toFixed(2)}`;
}

function touchKey(key: string): void {
  const idx = pageOrder.indexOf(key);
  if (idx !== -1) pageOrder.splice(idx, 1);
  pageOrder.push(key);
  while (pageOrder.length > PAGE_CACHE_LIMIT) {
    const evict = pageOrder.shift();
    if (!evict) break;
    const bmp = pageBitmaps.get(evict);
    bmp?.close();
    pageBitmaps.delete(evict);
  }
}

export function getCachedPageBitmap(
  docId: string,
  page: number,
  cssWidth: number,
  dpr: number
): ImageBitmap | undefined {
  const key = pageKey(docId, page, cssWidth, dpr);
  const bmp = pageBitmaps.get(key);
  if (bmp) touchKey(key);
  return bmp;
}

export function putCachedPageBitmap(
  docId: string,
  page: number,
  cssWidth: number,
  dpr: number,
  bitmap: ImageBitmap
): void {
  const key = pageKey(docId, page, cssWidth, dpr);
  const prev = pageBitmaps.get(key);
  if (prev && prev !== bitmap) prev.close();
  pageBitmaps.set(key, bitmap);
  touchKey(key);
}

export async function renderPageToBitmap(
  doc: PdfDoc,
  pageNumber: number,
  cssWidth: number,
  dpr: number
): Promise<ImageBitmap> {
  const page = await doc.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const cssScale = cssWidth / unscaled.width;
  const viewport = page.getViewport({ scale: cssScale * dpr });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Could not create canvas context.');
  }

  await page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  } as any).promise;

  return createImageBitmap(canvas);
}

export function prefetchPage(
  id: string,
  buffer: ArrayBuffer,
  pageNumber: number,
  cssWidth: number,
  dpr: number,
  pageCount: number
): void {
  if (pageNumber < 1 || pageNumber > pageCount) return;
  if (getCachedPageBitmap(id, pageNumber, cssWidth, dpr)) return;

  void (async () => {
    try {
      const doc = await getPdfDocument(id, buffer);
      const bmp = await renderPageToBitmap(doc, pageNumber, cssWidth, dpr);
      putCachedPageBitmap(id, pageNumber, cssWidth, dpr, bmp);
    } catch {
      // Prefetch is best-effort; a later explicit render will retry.
    }
  })();
}
