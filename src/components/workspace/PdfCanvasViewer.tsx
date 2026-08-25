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
  AlertTriangle,
  FileText
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';
import { TAG_CONFIGS } from '../../utils/helpers';

// Configure PDF.js bundled worker
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
  const [renderMode, setRenderMode] = useState<'canvas' | 'semantic'>('canvas');
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
        console.warn('PDF.js canvas render notice:', err);
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
    <div className="flex flex-col h-full bg-[#e8eae3] border-r border-slate-300 relative select-none font-sans">
      {/* Canvas Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shadow-subtle shrink-0 z-20">
        {/* Page Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
            className="text-xs font-mono bg-transparent text-slate-800 font-semibold px-1 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1} of {totalPages}
              </option>
            ))}
          </select>

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

        {/* View Mode Toggle (Canvas vs Semantic Flow) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setRenderMode('canvas')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              renderMode === 'canvas'
                ? 'bg-white text-teal-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PDF Canvas
          </button>
          <button
            onClick={() => setRenderMode('semantic')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              renderMode === 'semantic'
                ? 'bg-white text-teal-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semantic View
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

          <span className="text-xs font-mono text-slate-700 px-1 font-medium">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(2.2, s + 0.15))}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScale(1.15)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset Zoom to 100%"
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
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              showOverlays
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs font-medium'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle Tag Bounding Box Overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Boxes</span>
          </button>

          <button
            onClick={() => setShowFlowLines(!showFlowLines)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              showFlowLines
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs font-medium'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle Reading Order Flow Lines"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Flow</span>
          </button>

          <button
            onClick={() => setShowArtifacts(!showArtifacts)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              showArtifacts
                ? 'bg-slate-100 text-slate-700'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title="Toggle Decorative Artifacts Visibility"
          >
            {showArtifacts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll View */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex items-center justify-center relative"
      >
        {renderMode === 'semantic' ? (
          /* Semantic HTML Typographic View */
          <div className="bg-white rounded-xl shadow-modal border border-slate-300 p-8 max-w-2xl w-full space-y-4 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1 font-bold text-teal-800">
                <FileText className="w-4 h-4" />
                Semantic Flow Preview (Page {currentPage})
              </span>
              <span>{pageElements.length} Elements</span>
            </div>

            {pageElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const isSpoken = activeSpokenElementId === el.id;
              const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSpoken
                      ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-300 shadow-sm'
                      : isSelected
                      ? 'ring-2 ring-teal-600 bg-teal-50/60 border-teal-300 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs"
                      style={{ backgroundColor: config.color }}
                    >
                      {el.tag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Reading Order #{el.readingOrder}
                    </span>
                  </div>

                  {el.tag === 'H1' ? (
                    <h1 className="font-serif text-2xl font-bold text-slate-900">{el.text}</h1>
                  ) : el.tag === 'H2' ? (
                    <h2 className="font-serif text-xl font-bold text-slate-900">{el.text}</h2>
                  ) : el.tag === 'H3' ? (
                    <h3 className="font-serif text-lg font-bold text-slate-900">{el.text}</h3>
                  ) : el.tag === 'Figure' ? (
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-950 text-xs italic">
                      [Figure Graphic: {el.altText || 'No Alt Text Provided'}]
                    </div>
                  ) : el.tag === 'Table' ? (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                      [Data Table Matrix: {el.tableData?.rowCount || 3} Rows × {el.tableData?.colCount || 3} Columns]
                    </div>
                  ) : el.tag === 'Quote' ? (
                    <blockquote className="border-l-4 border-purple-500 pl-3 italic text-slate-800 text-sm">
                      "{el.text}"
                    </blockquote>
                  ) : (
                    <p className="text-slate-800 text-xs leading-relaxed">{el.text}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* PDF.js High-DPI Canvas View */
          <div 
            className="relative bg-white shadow-modal rounded-sm border border-slate-300 transition-all duration-150"
            style={{
              width: `${(canvasSize.width / 1.5) * (scale / 1.15)}px`,
              maxWidth: '100%',
            }}
          >
            {renderError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Notice: High-DPI vector preview active ({renderError})</span>
              </div>
            )}

            {/* Native Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-auto block rounded-sm pointer-events-none min-h-[400px]"
            />

            {/* SVG Vector Reading Order Flow Curves */}
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
                      {/* Reading Order Number & Tag Pill */}
                      <div
                        className={`absolute -top-3 left-1 flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold shadow-xs transition-all ${
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
        )}
      </div>
    </div>
  );
};
