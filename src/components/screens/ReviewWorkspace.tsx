import React, { useState, useEffect } from 'react';
import { 
  ArrowRight
} from 'lucide-react';
import type { EbookDocument, PdfElement } from '../../types/pdf';
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

  // When spoken element changes, auto-switch page and selection
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

  const handleUpdateElement = (updated: PdfElement) => {
    const newElements = document.elements.map((el) => (el.id === updated.id ? updated : el));
    const newReport = evaluateAccessibility(newElements, document.metadata);

    onUpdateDocument({
      ...document,
      elements: newElements,
      validationReport: newReport,
      updatedAt: new Date(),
    });
  };

  const handleReorderElement = (elementId: string, direction: 'up' | 'down') => {
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
  };

  const handleBulkArtifactHeaders = () => {
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
  };

  const selectedElement = document.elements.find((e) => e.id === selectedElementId) || null;
  const score = document.validationReport.overallScore;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden font-sans">
      {/* Top Workspace Status Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-4 shrink-0 shadow-subtle z-10">
        <div className="flex items-center gap-3 truncate">
          <span className="font-serif font-bold text-sm text-navy-900 truncate">
            {document.metadata.title}
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>{document.pageCount} Pages</span>
            <span>{document.elements.length} Tags</span>
            <span>Lang: {document.metadata.language}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Compliance:</span>
            <span
              className={`text-xs font-mono font-bold ${
                score >= 90 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {score}% ({document.validationReport.wcagLevel})
            </span>
          </div>

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
