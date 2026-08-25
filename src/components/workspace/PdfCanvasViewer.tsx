import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GitCommit,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';
import { TAG_CONFIGS } from '../../utils/helpers';
import {
  getCachedPageBitmap,
  getPdfDocument,
  prefetchPage,
  putCachedPageBitmap,
  renderPageToBitmap,
} from '../../services/pdfJsCache';

interface PdfCanvasViewerProps {
  document: EbookDocument;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  activeSpokenElementId?: string | null;
}

const DEFAULT_SCALE = 1.1;

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = React.memo(({
  document,
  selectedElementId,
  onSelectElement,
  currentPage,
  onPageChange,
  activeSpokenElementId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderGen = useRef(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showFlowLines, setShowFlowLines] = useState(true);
  const [showArtifacts, setShowArtifacts] = useState(true);
  const [renderMode, setRenderMode] = useState<'canvas' | 'semantic'>('canvas');
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const paintBitmap = useCallback((bitmap: ImageBitmap) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
  }, []);

  useEffect(() => {
    if (renderMode !== 'canvas') return;
    if (!document.pdfArrayBuffer) return;

    const gen = ++renderGen.current;
    const widthPx = Math.max(320, Math.round(595 * scale));

    const cached = getCachedPageBitmap(document.id, currentPage, widthPx, dpr);
    if (cached) {
      paintBitmap(cached);
      prefetchPage(document.id, document.pdfArrayBuffer, currentPage + 1, widthPx, dpr, document.pageCount);
      prefetchPage(document.id, document.pdfArrayBuffer, currentPage - 1, widthPx, dpr, document.pageCount);
      return;
    }

    let cancelled = false;
    setIsLoadingPage(true);
    setRenderError(null);

    (async () => {
      try {
        const pdfDoc = await getPdfDocument(document.id, document.pdfArrayBuffer!);
        if (cancelled || gen !== renderGen.current) return;
        const bmp = await renderPageToBitmap(pdfDoc, currentPage, widthPx, dpr);
        if (cancelled || gen !== renderGen.current) {
          bmp.close();
          return;
        }
        putCachedPageBitmap(document.id, currentPage, widthPx, dpr, bmp);
        paintBitmap(bmp);
        prefetchPage(document.id, document.pdfArrayBuffer!, currentPage + 1, widthPx, dpr, document.pageCount);
        prefetchPage(document.id, document.pdfArrayBuffer!, currentPage - 1, widthPx, dpr, document.pageCount);
      } catch (err: any) {
        if (!cancelled && gen === renderGen.current) {
          setRenderError(err?.message || 'Could not render this page.');
        }
      } finally {
        if (!cancelled && gen === renderGen.current) setIsLoadingPage(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [document.id, document.pdfArrayBuffer, document.pageCount, currentPage, scale, dpr, renderMode, paintBitmap]);

  const pageElements = useMemo(() => {
    return document.elements
      .filter((el) => el.pageNumber === currentPage)
      .filter((el) => showArtifacts || el.tag !== 'Artifact')
      .sort((a, b) => a.readingOrder - b.readingOrder);
  }, [document.elements, currentPage, showArtifacts]);

  const totalPages = document.pageCount || 1;
  const cssDisplayWidth = Math.round(595 * scale);

  return (
    <div className="flex flex-col h-full bg-[#eef1f4] relative select-none font-sans">
      <div className="bg-white border-b border-slate-200/80 px-3 h-12 flex items-center gap-2 shrink-0 z-20">
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-full">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-full text-slate-700 hover:bg-white disabled:opacity-30"
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <label className="sr-only" htmlFor="page-select">Page</label>
          <select
            id="page-select"
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
            className="text-[11px] font-mono bg-transparent text-slate-800 font-medium px-1 focus:outline-none cursor-pointer tabular-nums"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} / {totalPages}
              </option>
            ))}
          </select>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-full text-slate-700 hover:bg-white disabled:opacity-30"
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center text-[11px] bg-slate-100 p-0.5 rounded-full">
          <button
            onClick={() => setRenderMode('canvas')}
            className={`px-2.5 py-1 rounded-full ${
              renderMode === 'canvas' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Page
          </button>
          <button
            onClick={() => setRenderMode('semantic')}
            className={`px-2.5 py-1 rounded-full ${
              renderMode === 'semantic' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Text
          </button>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-full">
          <button
            onClick={() => setScale((s) => Math.max(0.6, +(s - 0.15).toFixed(2)))}
            className="p-1.5 rounded-full text-slate-600 hover:bg-white"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-700 w-10 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.2, +(s + 0.15).toFixed(2)))}
            className="p-1.5 rounded-full text-slate-600 hover:bg-white"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(DEFAULT_SCALE)}
            className="p-1.5 rounded-full text-slate-600 hover:bg-white"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-full">
          {isLoadingPage && (
            <span className="text-[10px] font-mono text-slate-500 px-2">Loading…</span>
          )}
          <button
            onClick={() => setShowOverlays((v) => !v)}
            className={showOverlays ? 'p-1.5 rounded-full text-teal-900 bg-white shadow-xs' : 'p-1.5 rounded-full text-slate-700 hover:bg-white'}
            title="Toggle tag boxes"
            aria-pressed={showOverlays}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowFlowLines((v) => !v)}
            className={showFlowLines ? 'p-1.5 rounded-full text-teal-900 bg-white shadow-xs' : 'p-1.5 rounded-full text-slate-700 hover:bg-white'}
            title="Toggle reading-order lines"
            aria-pressed={showFlowLines}
          >
            <GitCommit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowArtifacts((v) => !v)}
            className={`p-1.5 rounded-full ${showArtifacts ? 'text-slate-700 bg-white shadow-xs' : 'text-slate-400 hover:bg-white'}`}
            title="Toggle artifacts"
            aria-pressed={showArtifacts}
          >
            {showArtifacts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 flex justify-center items-start">
        {renderMode === 'semantic' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 max-w-[42rem] w-full text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-navy-900 font-medium">
                <FileText className="w-3.5 h-3.5" />
                Page {currentPage} reading order
              </span>
              <span>{pageElements.length} tags</span>
            </div>
            <div className="space-y-3">
              {pageElements.map((el) => {
                const isSelected = selectedElementId === el.id;
                const isSpoken = activeSpokenElementId === el.id;
                const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
                return (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => onSelectElement(el.id)}
                    className={`w-full text-left p-3 rounded-xl border ${
                      isSpoken
                        ? 'border-amber-400 bg-amber-50'
                        : isSelected
                        ? 'border-teal-300 bg-teal-50'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-1.5 py-px text-[10px] font-mono font-semibold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {el.tag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 tabular-nums">#{el.readingOrder}</span>
                    </div>
                    {el.tag === 'H1' ? (
                      <h1 className="font-serif text-2xl font-bold text-slate-900">{el.text}</h1>
                    ) : el.tag === 'H2' ? (
                      <h2 className="font-serif text-xl font-bold text-slate-900">{el.text}</h2>
                    ) : el.tag === 'H3' ? (
                      <h3 className="font-serif text-lg font-semibold text-slate-900">{el.text}</h3>
                    ) : el.tag === 'Figure' ? (
                      <p className="text-xs italic text-teal-900">Figure: {el.altText || 'Needs alt text'}</p>
                    ) : el.tag === 'Quote' ? (
                      <blockquote className="pl-3 border-l border-slate-400 italic text-sm text-slate-800">{el.text}</blockquote>
                    ) : (
                      <p className="text-sm leading-relaxed text-slate-800">{el.text}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="relative bg-white shadow-float rounded-lg border border-slate-200"
            style={{ width: cssDisplayWidth, maxWidth: '100%' }}
          >
            {renderError && (
              <div className="p-2 bg-amber-50 border-b border-amber-200 text-amber-950 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{renderError}</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-auto block pointer-events-none rounded-lg"
              style={{ minHeight: 240 }}
            />

            {(showFlowLines || showOverlays) && pageElements.length > 0 && (
              <svg
                className="absolute inset-0 w-full h-full z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden={!showOverlays}
              >
                {showFlowLines &&
                  pageElements.map((el, i) => {
                    if (i === pageElements.length - 1) return null;
                    const nextEl = pageElements[i + 1];
                    return (
                      <line
                        key={`flow-${el.id}`}
                        x1={el.bbox.x + el.bbox.width / 2}
                        y1={el.bbox.y + el.bbox.height / 2}
                        x2={nextEl.bbox.x + nextEl.bbox.width / 2}
                        y2={nextEl.bbox.y + nextEl.bbox.height / 2}
                        stroke="#0f766e"
                        strokeWidth="0.35"
                        strokeDasharray="1 0.8"
                        strokeOpacity="0.7"
                        pointerEvents="none"
                      />
                    );
                  })}
                {showOverlays &&
                  pageElements.map((el) => {
                    const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
                    const isSelected = selectedElementId === el.id;
                    const isSpoken = activeSpokenElementId === el.id;
                    return (
                      <rect
                        key={el.id}
                        x={el.bbox.x}
                        y={el.bbox.y}
                        width={el.bbox.width}
                        height={el.bbox.height}
                        fill={isSpoken ? 'rgba(217,119,6,0.22)' : isSelected ? 'rgba(15,118,110,0.18)' : `${config.color}22`}
                        stroke={isSpoken ? '#d97706' : isSelected ? '#0f766e' : config.color}
                        strokeWidth={isSelected || isSpoken ? 0.7 : 0.35}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectElement(el.id);
                        }}
                      />
                    );
                  })}
              </svg>
            )}

            {showOverlays && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {pageElements.map((el) => {
                  const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
                  const isSelected = selectedElementId === el.id;
                  const isSpoken = activeSpokenElementId === el.id;
                  return (
                    <div
                      key={`label-${el.id}`}
                      className="absolute font-mono text-[9px] font-semibold text-white px-1.5 leading-4 rounded-t-md rounded-br-md"
                      style={{
                        left: `${el.bbox.x}%`,
                        top: `${Math.max(0, el.bbox.y)}%`,
                        transform: 'translateY(-100%)',
                        backgroundColor: isSpoken ? '#d97706' : isSelected ? '#115e59' : config.color,
                      }}
                    >
                      #{el.readingOrder} {el.tag}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PdfCanvasViewer.displayName = 'PdfCanvasViewer';
