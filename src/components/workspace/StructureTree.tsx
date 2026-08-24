import React, { useState, useMemo } from 'react';
import { 
  ListTree, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';
import { TAG_CONFIGS } from '../../utils/helpers';

interface StructureTreeProps {
  document: EbookDocument;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onReorderElement: (elementId: string, direction: 'up' | 'down') => void;
  onBulkArtifactHeaders: () => void;
  activeSpokenElementId?: string | null;
}

export const StructureTree: React.FC<StructureTreeProps> = ({
  document,
  selectedElementId,
  onSelectElement,
  onReorderElement,
  onBulkArtifactHeaders,
  activeSpokenElementId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'HEADINGS' | 'FIGURES' | 'TABLES' | 'FLAGGED' | 'ARTIFACTS'>('ALL');

  // Filter elements
  const filteredElements = useMemo(() => {
    return document.elements
      .filter((el) => {
        // Tag filter
        if (tagFilter === 'HEADINGS' && !el.tag.startsWith('H')) return false;
        if (tagFilter === 'FIGURES' && el.tag !== 'Figure') return false;
        if (tagFilter === 'TABLES' && el.tag !== 'Table') return false;
        if (tagFilter === 'ARTIFACTS' && el.tag !== 'Artifact') return false;
        if (tagFilter === 'FLAGGED' && !el.isFlaggedForReview && (el.tag !== 'Figure' || !!el.altText)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            el.text.toLowerCase().includes(q) ||
            el.tag.toLowerCase().includes(q) ||
            (el.altText && el.altText.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.readingOrder - b.readingOrder);
  }, [document.elements, tagFilter, searchQuery]);

  const selectedIndex = document.elements.findIndex((e) => e.id === selectedElementId);
  const canMoveUp = selectedIndex > 0;
  const canMoveDown = selectedIndex !== -1 && selectedIndex < document.elements.length - 1;

  const flaggedCount = document.elements.filter(
    (el) => el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText)
  ).length;

  return (
    <div className="flex flex-col h-full bg-[#fbfbf9] border-r border-slate-200 select-none">
      {/* Header & Controls */}
      <div className="p-3 bg-white border-b border-slate-200 shrink-0 space-y-2.5 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-teal-600" />
            <h2 className="font-serif font-bold text-sm text-navy-900">
              Document Structure Tree
            </h2>
          </div>

          {/* Quick Reorder Buttons */}
          <div className="flex items-center gap-1">
            <button
              disabled={!canMoveUp}
              onClick={() => selectedElementId && onReorderElement(selectedElementId, 'up')}
              className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Move Up in Reading Order"
              aria-label="Move Up in Reading Order"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={!canMoveDown}
              onClick={() => selectedElementId && onReorderElement(selectedElementId, 'down')}
              className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Move Down in Reading Order"
              aria-label="Move Down in Reading Order"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search text, tags, alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 items-center">
          {(['ALL', 'HEADINGS', 'FIGURES', 'TABLES', 'FLAGGED', 'ARTIFACTS'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTagFilter(filter)}
              className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-colors ${
                tagFilter === filter
                  ? 'bg-teal-700 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'FLAGGED' ? `Flagged (${flaggedCount})` : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tree Node List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredElements.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-slate-400">
            No matching semantic elements found.
          </div>
        ) : (
          filteredElements.map((el) => {
            const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
            const isSelected = selectedElementId === el.id;
            const isSpoken = activeSpokenElementId === el.id;
            const isFlagged = el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText);

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id)}
                className={`flex items-start gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                  isSpoken
                    ? 'bg-amber-100 border-amber-500 text-amber-950 font-medium shadow-sm ring-2 ring-amber-400'
                    : isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-medium shadow-sm ring-1 ring-teal-400'
                    : 'bg-white border-slate-200/80 hover:border-teal-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {/* Reading Order Badge */}
                <div
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5"
                  style={{
                    backgroundColor: config.bgLight,
                    color: config.textColor,
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  #{el.readingOrder}
                </div>

                {/* Tag pill */}
                <div
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5"
                  style={{
                    backgroundColor: config.color,
                    color: '#ffffff',
                  }}
                >
                  {el.tag}
                </div>

                {/* Content summary */}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-slate-900 font-sans">
                    {el.tag === 'Figure' ? (
                      <span className="italic text-teal-800">
                        {el.altText ? `[Alt: ${el.altText}]` : '[⚠️ Needs Alt Text]'}
                      </span>
                    ) : el.tag === 'Artifact' ? (
                      <span className="text-slate-400 italic">
                        {el.text || '[Decorative Artifact]'}
                      </span>
                    ) : (
                      el.text || `[Empty ${el.tag}]`
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                    <span>Pg {el.pageNumber}</span>
                    <span>•</span>
                    <span
                      className={`${
                        el.confidence >= 0.9
                          ? 'text-emerald-700'
                          : el.confidence >= 0.8
                          ? 'text-teal-700'
                          : 'text-amber-700 font-bold'
                      }`}
                    >
                      {Math.round(el.confidence * 100)}% conf
                    </span>
                    {el.column && el.column > 1 && (
                      <>
                        <span>•</span>
                        <span>Col {el.column}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Warning flag icon */}
                {isFlagged && (
                  <div className="shrink-0 mt-0.5" title="Flagged for human review">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Bulk Action Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
        <button
          onClick={onBulkArtifactHeaders}
          className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
          title="Auto-convert detected running headers and page numbers to Artifacts"
        >
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Auto-Artifact Running Headers</span>
        </button>
      </div>
    </div>
  );
};
