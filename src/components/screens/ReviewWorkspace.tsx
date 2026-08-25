import React, { useState, useEffect, useCallback } from 'react';
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

  const handleSelectElement = (elementId: string) => {
    setSelectedElementId(elementId);
    const el = document.elements.find((e) => e.id === elementId);
    if (el && el.pageNumber !== currentPage) {
      setCurrentPage(el.pageNumber);
    }
  };

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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top Workspace Status Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-4 shrink-0 shadow-subtle z-10">
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center gap-1.5 text-navy-950 font-serif font-bold text-sm truncate">
            <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">{document.metadata.title}</span>
          </div>

          <span className="text-xs text-slate-300 hidden md:inline">•</span>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span>{document.pageCount} Pages</span>
            <span>{document.elements.length} Tags</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              Lang: {document.metadata.language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Compliance Status Pill */}
          <div
            onClick={onNavigateToValidation}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border cursor-pointer transition-all ${
              score >= 90
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
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
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Validation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Pane Desktop Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: PDF Canvas Viewer (6 cols = 50%) */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <PdfCanvasViewer
            document={document}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeSpokenElementId={activeSpokenElementId}
          />
        </div>

        {/* Center Pane: Structure Tree (3 cols = 25%) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
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

        {/* Right Pane: Element Inspector (3 cols = 25%) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
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
