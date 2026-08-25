import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import type { EbookDocument, PdfElement, PdfTagType } from '../../types/pdf';
import { PdfCanvasViewer } from '../workspace/PdfCanvasViewer';
import { StructureTree } from '../workspace/StructureTree';
import { ElementInspector } from '../workspace/ElementInspector';
import { evaluateAccessibility } from '../../services/accessibilityValidator';

const PANE_STORAGE_KEY = 'pdf-tagger-pane-weights';
const DEFAULT_PANES: [number, number, number] = [52, 24, 24];
const MIN_PANES: [number, number, number] = [32, 16, 18];

function loadPaneWeights(): [number, number, number] {
  try {
    const raw = localStorage.getItem(PANE_STORAGE_KEY);
    if (!raw) return DEFAULT_PANES;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      parsed.every((n) => typeof n === 'number' && n > 0)
    ) {
      return parsed as [number, number, number];
    }
  } catch {
    /* keep defaults */
  }
  return DEFAULT_PANES;
}

function PaneSplit({
  label,
  onDrag,
}: {
  label: string;
  onDrag: (dxPx: number, containerWidth: number) => void;
}) {
  const startX = useRef(0);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const root = e.currentTarget.parentElement;
    if (!root) return;
    onDrag(e.clientX - startX.current, root.getBoundingClientRect().width);
    startX.current = e.clientX;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      className="pane-split hidden lg:flex"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onDrag(-24, e.currentTarget.parentElement?.getBoundingClientRect().width || 1200);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onDrag(24, e.currentTarget.parentElement?.getBoundingClientRect().width || 1200);
        }
      }}
    />
  );
}

interface ReviewWorkspaceProps {
  document: EbookDocument;
  onUpdateDocument: (doc: EbookDocument) => void;
  onNavigateToValidation: () => void;
  activeSpokenElementId?: string | null;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  document,
  onUpdateDocument,
  onNavigateToValidation,
  activeSpokenElementId,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    document.elements[0]?.id || null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paneWeights, setPaneWeights] = useState<[number, number, number]>(loadPaneWeights);

  const clampPanes = (a: number, b: number, c: number): [number, number, number] => {
    const x = Math.max(MIN_PANES[0], a);
    const y = Math.max(MIN_PANES[1], b);
    const z = Math.max(MIN_PANES[2], c);
    const sum = x + y + z;
    return [(x / sum) * 100, (y / sum) * 100, (z / sum) * 100];
  };

  const persistPanes = (next: [number, number, number]) => {
    try {
      localStorage.setItem(PANE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
    return next;
  };

  const dragFirstSplit = (dxPx: number, containerWidth: number) => {
    if (containerWidth <= 0) return;
    const dx = (dxPx / containerWidth) * 100;
    setPaneWeights((prev) => persistPanes(clampPanes(prev[0] + dx, prev[1] - dx, prev[2])));
  };

  const dragSecondSplit = (dxPx: number, containerWidth: number) => {
    if (containerWidth <= 0) return;
    const dx = (dxPx / containerWidth) * 100;
    setPaneWeights((prev) => persistPanes(clampPanes(prev[0], prev[1] + dx, prev[2] - dx)));
  };

  // Sync selection and page when spoken element changes
  useEffect(() => {
    if (activeSpokenElementId) {
      const spokenEl = document.elements.find((e) => e.id === activeSpokenElementId);
      if (spokenEl) {
        setSelectedElementId(spokenEl.id);
        if (spokenEl.pageNumber !== currentPage) {
          setCurrentPage(spokenEl.pageNumber);
        }
      }
    }
  }, [activeSpokenElementId, currentPage, document.elements]);

  const handleSelectElement = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
    const el = document.elements.find((e) => e.id === elementId);
    if (el) {
      setCurrentPage((page) => (el.pageNumber !== page ? el.pageNumber : page));
    }
  }, [document.elements]);

  const handleUpdateElement = useCallback((updated: PdfElement) => {
    const newElements = document.elements.map((el) => (el.id === updated.id ? updated : el));
    const newReport = evaluateAccessibility(newElements, document.metadata);

    onUpdateDocument({
      ...document,
      elements: newElements,
      validationReport: newReport,
      updatedAt: new Date(),
    });
  }, [document, onUpdateDocument]);

  const handleReorderElement = useCallback((elementId: string, direction: 'up' | 'down') => {
    const elementsCopy = [...document.elements].sort((a, b) => a.readingOrder - b.readingOrder);
    const index = elementsCopy.findIndex((e) => e.id === elementId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= elementsCopy.length) return;

    // Swap elements
    const temp = elementsCopy[index];
    elementsCopy[index] = elementsCopy[targetIndex];
    elementsCopy[targetIndex] = temp;

    // Re-assign sequential reading orders
    elementsCopy.forEach((el, i) => {
      el.readingOrder = i + 1;
    });

    const newReport = evaluateAccessibility(elementsCopy, document.metadata);

    onUpdateDocument({
      ...document,
      elements: elementsCopy,
      validationReport: newReport,
      updatedAt: new Date(),
    });
  }, [document, onUpdateDocument]);

  const handleBulkArtifactHeaders = useCallback(() => {
    const updatedElements = document.elements.map((el) => {
      const isHeaderFooter =
        el.text.toLowerCase().includes('page ') ||
        (el.bbox.y < 6 && el.fontSize !== undefined && el.fontSize < 10) ||
        (el.bbox.y > 94 && el.text.trim().match(/^\d+$/));

      if (isHeaderFooter && el.tag === 'P') {
        return {
          ...el,
          tag: 'Artifact' as const,
          isDecorative: true,
          confidence: 0.99,
          isFlaggedForReview: false,
        };
      }
      return el;
    });

    const newReport = evaluateAccessibility(updatedElements, document.metadata);

    onUpdateDocument({
      ...document,
      elements: updatedElements,
      validationReport: newReport,
      updatedAt: new Date(),
    });
  }, [document, onUpdateDocument]);

  // Keyboard hotkeys for fast tagging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!selectedElementId) return;

      const selectedEl = document.elements.find((el) => el.id === selectedElementId);
      if (!selectedEl) return;

      // Reordering shortcuts: Ctrl/Cmd + ArrowUp/Down
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        handleReorderElement(selectedElementId, 'up');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        handleReorderElement(selectedElementId, 'down');
        return;
      }

      // Quick Tag hotkeys (1-6 for H1-H6, P, F, T, L, A)
      const tagMap: Record<string, PdfTagType> = {
        '1': 'H1',
        '2': 'H2',
        '3': 'H3',
        '4': 'H4',
        '5': 'H5',
        '6': 'H6',
        'p': 'P',
        'P': 'P',
        'f': 'Figure',
        'F': 'Figure',
        't': 'Table',
        'T': 'Table',
        'l': 'ListItem',
        'L': 'ListItem',
        'a': 'Artifact',
        'A': 'Artifact',
      };

      if (tagMap[e.key]) {
        e.preventDefault();
        const newTag = tagMap[e.key];
        handleUpdateElement({
          ...selectedEl,
          tag: newTag,
          confidence: 1.0,
          isDecorative: newTag === 'Artifact' ? true : selectedEl.isDecorative,
          isFlaggedForReview: false,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, document.elements, handleReorderElement, handleUpdateElement]);

  const selectedElement = document.elements.find((e) => e.id === selectedElementId) || null;
  const score = document.validationReport.overallScore;
  const isPerfect = score >= 98;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden font-sans">
      {/* Top Workspace Status Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 h-12 flex items-center justify-between gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center gap-1.5 text-navy-950 font-serif font-bold text-sm truncate">
            <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">{document.metadata.title}</span>
          </div>

          <span className="text-xs text-slate-300 hidden md:inline">•</span>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span>{document.pageCount} Pages</span>
            <span>{document.elements.length} Tags</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Lang: {document.metadata.language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Compliance Status Pill */}
          <div
            onClick={onNavigateToValidation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${
              score >= 90
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
            title="Click to view full Accessibility Validation Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-bold">
              {score}% ({document.validationReport.wcagLevel})
            </span>
            {isPerfect && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          </div>

          {/* Proceed to Validation Button */}
          <button
            onClick={onNavigateToValidation}
            className="px-4 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-sm flex items-center gap-1.5"
          >
            <span>Proceed to Validation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="review-panes flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: `${paneWeights[0]}fr 10px ${paneWeights[1]}fr 10px ${paneWeights[2]}fr`,
        }}
      >
        <div className="h-full min-w-0 overflow-hidden contain-pane">
          <PdfCanvasViewer
            document={document}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeSpokenElementId={activeSpokenElementId}
          />
        </div>

        <PaneSplit label="Resize canvas and structure tree" onDrag={dragFirstSplit} />

        <div className="h-full min-w-0 overflow-hidden contain-pane">
          <StructureTree
            document={document}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            onReorderElement={handleReorderElement}
            onBulkArtifactHeaders={handleBulkArtifactHeaders}
            onUpdateElement={handleUpdateElement}
            activeSpokenElementId={activeSpokenElementId}
          />
        </div>

        <PaneSplit label="Resize structure tree and inspector" onDrag={dragSecondSplit} />

        <div className="h-full min-w-0 overflow-hidden contain-pane">
          <ElementInspector
            element={selectedElement}
            allElements={document.elements}
            onUpdateElement={handleUpdateElement}
          />
        </div>
      </div>
    </div>
  );
};
