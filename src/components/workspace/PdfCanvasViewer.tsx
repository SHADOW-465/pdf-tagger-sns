import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  GitCommit, 
  AlertCircle,
  Layers,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';
import { TAG_CONFIGS } from '../../utils/helpers';

// Set up PDF.js local bundled worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface PdfCanvasViewerProps {
  document: EbookDocument;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  activeSpokenElementId?: string | null;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  document,
  selectedElementId,
  onSelectElement,
  currentPage,
  onPageChange,
  activeSpokenElementId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.15);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showFlowLines, setShowFlowLines] = useState(true);
  const [showArtifacts, setShowArtifacts] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 595, height: 842 });
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Render PDF.js page onto canvas
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!canvasRef.current || !document.pdfArrayBuffer) return;

      setIsLoadingPage(true);
      setRenderError(null);
      try {
        // Clone buffer to avoid detached ArrayBuffer transfer issues in PDF.js
        const bufferCopy = document.pdfArrayBuffer.slice(0);
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(bufferCopy),
          useSystemFonts: true,
        });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(currentPage);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale: scale * 1.5 }); // High-DPI render
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          setCanvasSize({ width: viewport.width, height: viewport.height });

          const renderContext: any = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderContext).promise;
        }
      } catch (err: any) {
        console.warn('PDF.js canvas render issue:', err);
        if (!isCancelled) {
          setRenderError(err?.message || 'Error rendering PDF canvas.');
        }
      } finally {
        if (!isCancelled) setIsLoadingPage(false);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [document.pdfArrayBuffer, currentPage, scale]);

  const pageElements = document.elements
    .filter((el) => el.pageNumber === currentPage)
    .filter((el) => showArtifacts || el.tag !== 'Artifact')
    .sort((a, b) => a.readingOrder - b.readingOrder);

  const totalPages = document.pageCount || 1;

  return (
    <div className="flex flex-col h-full bg-[#e8eae3] border-r border-slate-300 relative select-none">
      {/* Top Canvas Toolbar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shadow-subtle shrink-0">
        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono px-2 text-slate-800 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.7, s - 0.15))}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-600 px-1">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScale(1.15)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset Zoom (Fit)"
            aria-label="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1">
          {isLoadingPage && (
            <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin mr-1" />
          )}

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showOverlays
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle Tag Bounding Box Overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Boxes</span>
          </button>

          <button
            onClick={() => setShowFlowLines(!showFlowLines)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showFlowLines
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle Reading Order Flow Vector Lines"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Flow</span>
          </button>

          <button
            onClick={() => setShowArtifacts(!showArtifacts)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showArtifacts
                ? 'bg-slate-100 text-slate-700'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title="Toggle Decorative Artifacts"
          >
            {showArtifacts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex items-center justify-center relative"
      >
        <div 
          className="relative bg-white shadow-modal rounded-sm border border-slate-300 transition-all duration-150"
          style={{
            width: `${(canvasSize.width / 1.5) * (scale / 1.15)}px`,
            maxWidth: '100%',
          }}
        >
          {renderError && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Canvas render notice: {renderError} (Bounding box overlays active)</span>
            </div>
          )}

          {/* Native PDF.js Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-auto block rounded-sm pointer-events-none min-h-[400px]"
          />

          {/* SVG Vector Reading Order Flow Lines */}
          {showFlowLines && pageElements.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {pageElements.map((el, i) => {
                if (i === pageElements.length - 1) return null;
                const nextEl = pageElements[i + 1];
                const x1 = el.bbox.x + el.bbox.width / 2;
                const y1 = el.bbox.y + el.bbox.height / 2;
                const x2 = nextEl.bbox.x + nextEl.bbox.width / 2;
                const y2 = nextEl.bbox.y + nextEl.bbox.height / 2;

                return (
                  <g key={`flow-${el.id}-${nextEl.id}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#0f766e"
                      strokeWidth="0.4"
                      strokeDasharray="1, 0.8"
                      strokeOpacity="0.75"
                    />
                    <circle
                      cx={x2}
                      cy={y2}
                      r="0.6"
                      fill="#0f766e"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive Bounding Box Overlays */}
          {showOverlays && (
            <div className="absolute inset-0 z-20">
              {pageElements.map((el) => {
                const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
                const isSelected = selectedElementId === el.id;
                const isSpoken = activeSpokenElementId === el.id;
                const isWarning = el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText);

                return (
                  <div
                    key={el.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectElement(el.id);
                    }}
                    className={`absolute cursor-pointer transition-all rounded-[3px] border group ${
                      isSpoken
                        ? 'ring-4 ring-amber-500 border-amber-600 bg-amber-400/30 z-40 animate-pulse'
                        : isSelected
                        ? 'ring-2 ring-teal-600 border-teal-700 bg-teal-500/20 shadow-md z-30'
                        : 'border-slate-400/50 hover:border-teal-500 hover:bg-teal-500/10 z-10'
                    }`}
                    style={{
                      left: `${el.bbox.x}%`,
                      top: `${el.bbox.y}%`,
                      width: `${el.bbox.width}%`,
                      height: `${el.bbox.height}%`,
                      borderColor: isSelected || isSpoken ? undefined : config.color,
                      backgroundColor: isSelected || isSpoken ? undefined : `${config.color}15`,
                    }}
                  >
                    {/* Tag & Reading Order Number Badge */}
                    <div
                      className={`absolute -top-3 left-1 flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold shadow-sm transition-all ${
                        isSpoken
                          ? 'bg-amber-600 text-white'
                          : isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-900/90 text-white group-hover:bg-teal-800'
                      }`}
                      style={{
                        backgroundColor: isSelected || isSpoken ? undefined : config.color,
                      }}
                    >
                      <span>#{el.readingOrder}</span>
                      <span>{el.tag}</span>
                      {isWarning && (
                        <AlertCircle className="w-2.5 h-2.5 text-amber-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
