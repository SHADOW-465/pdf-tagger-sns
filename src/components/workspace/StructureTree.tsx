import React, { useState, useMemo } from 'react';
import { 
  ListTree, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  FolderTree,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Volume2,
  FileCheck,
  Flag
} from 'lucide-react';
import type { EbookDocument, PdfElement, PdfTagType } from '../../types/pdf';
import { TAG_CONFIGS, buildHierarchyTree, type HierarchyTreeNode } from '../../utils/helpers';
import { screenReaderService } from '../../services/speechSynthesizer';

interface StructureTreeProps {
  document: EbookDocument;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onReorderElement: (elementId: string, direction: 'up' | 'down') => void;
  onBulkArtifactHeaders: () => void;
  onUpdateElement?: (updated: PdfElement) => void;
  activeSpokenElementId?: string | null;
}

export const StructureTree: React.FC<StructureTreeProps> = ({
  document,
  selectedElementId,
  onSelectElement,
  onReorderElement,
  onBulkArtifactHeaders,
  onUpdateElement,
  activeSpokenElementId,
}) => {
  const [viewMode, setViewMode] = useState<'linear' | 'hierarchy'>('linear');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'HEADINGS' | 'FIGURES' | 'TABLES' | 'FLAGGED' | 'ARTIFACTS' | 'LOW_CONF'>('ALL');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root-doc': true });

  // Filter elements for Linear mode
  const filteredElements = useMemo(() => {
    return document.elements
      .filter((el) => {
        // Tag filter
        if (tagFilter === 'HEADINGS' && !el.tag.startsWith('H')) return false;
        if (tagFilter === 'FIGURES' && el.tag !== 'Figure') return false;
        if (tagFilter === 'TABLES' && el.tag !== 'Table') return false;
        if (tagFilter === 'ARTIFACTS' && el.tag !== 'Artifact') return false;
        if (tagFilter === 'LOW_CONF' && el.confidence >= 0.85) return false;
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

  // Build hierarchy tree for Hierarchical mode
  const hierarchyTree = useMemo(() => {
    return buildHierarchyTree(document.elements, document.metadata.title);
  }, [document.elements, document.metadata.title]);

  const toggleNodeExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const selectedIndex = document.elements.findIndex((e) => e.id === selectedElementId);
  const canMoveUp = selectedIndex > 0;
  const canMoveDown = selectedIndex !== -1 && selectedIndex < document.elements.length - 1;

  const flaggedCount = document.elements.filter(
    (el) => el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText)
  ).length;

  const lowConfCount = document.elements.filter((el) => el.confidence < 0.85).length;

  const handleQuickTagChange = (elementId: string, newTag: PdfTagType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateElement) return;
    const el = document.elements.find((item) => item.id === elementId);
    if (!el) return;

    onUpdateElement({
      ...el,
      tag: newTag,
      confidence: 1.0,
      isFlaggedForReview: false,
      isDecorative: newTag === 'Artifact' ? true : el.isDecorative,
    });
  };

  const handleAuditionNode = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    screenReaderService.playFromElement(elementId);
  };

  // Render a hierarchy tree node recursively
  const renderHierarchyNode = (node: HierarchyTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes[node.id] ?? true;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.element && selectedElementId === node.element.id;
    const isSpoken = node.element && activeSpokenElementId === node.element.id;
    const tagConfig = node.tag ? TAG_CONFIGS[node.tag] : null;

    if (node.type === 'document') {
      return (
        <div key={node.id} className="space-y-1">
          <div
            onClick={(e) => toggleNodeExpand(node.id, e)}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 font-serif font-bold text-xs text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span className="truncate">{node.title}</span>
            <span className="text-[10px] font-mono text-slate-500 ml-auto">{document.elements.length} nodes</span>
          </div>
          {isExpanded && (
            <div className="pl-2 space-y-1">
              {node.children.map((child) => renderHierarchyNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => node.element && onSelectElement(node.element.id)}
          className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
            isSpoken
              ? 'bg-amber-100 border-amber-500 text-amber-950 font-medium shadow-sm ring-2 ring-amber-400'
              : isSelected
              ? 'bg-teal-50 border-teal-500 text-teal-950 font-medium shadow-sm ring-1 ring-teal-400'
              : 'bg-white border-slate-200/80 hover:border-teal-300 hover:bg-slate-50 text-slate-800'
          }`}
          style={{ marginLeft: `${Math.min(level * 10, 30)}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleNodeExpand(node.id, e)}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <div className="w-3" />
          )}

          {tagConfig && (
            <span
              className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold text-white shrink-0"
              style={{ backgroundColor: tagConfig.color }}
            >
              {node.tag}
            </span>
          )}

          <span className="truncate flex-1 font-sans text-slate-800 text-[11.5px]">
            {node.title}
          </span>

          {node.isFlagged && (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child) => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] border-r border-slate-200 select-none font-sans">
      {/* Header & Controls */}
      <div className="p-3 bg-white border-b border-slate-200 shrink-0 space-y-2.5 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-teal-600" />
            <h2 className="font-serif font-bold text-sm text-navy-900">
              Structure Tree
            </h2>
          </div>

          {/* View Mode Toggle & Reorder Buttons */}
          <div className="flex items-center gap-1">
            {/* Linear vs Hierarchy Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-1">
              <button
                onClick={() => setViewMode('linear')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-all ${
                  viewMode === 'linear'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Linear Reading Order Flow View"
              >
                <Layers className="w-3 h-3 inline mr-1" />
                Flow
              </button>
              <button
                onClick={() => setViewMode('hierarchy')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-all ${
                  viewMode === 'hierarchy'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Hierarchical Chapter & Heading Tree View"
              >
                <FolderTree className="w-3 h-3 inline mr-1" />
                Tree
              </button>
            </div>

            {/* Move Up / Down Buttons */}
            <button
              disabled={!canMoveUp}
              onClick={() => selectedElementId && onReorderElement(selectedElementId, 'up')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-slate-200/60"
              title="Move Selected Element Up in Reading Order (Ctrl+Up)"
              aria-label="Move Up in Reading Order"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={!canMoveDown}
              onClick={() => selectedElementId && onReorderElement(selectedElementId, 'down')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-slate-200/60"
              title="Move Selected Element Down in Reading Order (Ctrl+Down)"
              aria-label="Move Down in Reading Order"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tags, text, alt-text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-1 items-center">
          {(['ALL', 'HEADINGS', 'FIGURES', 'TABLES', 'FLAGGED', 'LOW_CONF', 'ARTIFACTS'] as const).map((filter) => {
            const isActive = tagFilter === filter;
            let label: string = filter;
            if (filter === 'HEADINGS') label = 'Headings';
            if (filter === 'FIGURES') label = 'Figures';
            if (filter === 'TABLES') label = 'Tables';
            if (filter === 'FLAGGED') label = `Flagged (${flaggedCount})`;
            if (filter === 'LOW_CONF') label = `Low Conf (${lowConfCount})`;
            if (filter === 'ARTIFACTS') label = 'Artifacts';

            return (
              <button
                key={filter}
                onClick={() => setTagFilter(filter)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nodes Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {viewMode === 'hierarchy' ? (
          <div className="space-y-1">
            {renderHierarchyNode(hierarchyTree)}
          </div>
        ) : filteredElements.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-slate-400">
            No matching semantic elements found.
          </div>
        ) : (
          filteredElements.map((el) => {
            const config = TAG_CONFIGS[el.tag] || TAG_CONFIGS.P;
            const isSelected = selectedElementId === el.id;
            const isSpoken = activeSpokenElementId === el.id;
            const isFlagged = el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText);
            const isLowConf = el.confidence < 0.85;

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id)}
                className={`group flex items-start gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                  isSpoken
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-medium shadow-sm ring-2 ring-amber-400'
                    : isSelected
                    ? 'bg-teal-50/90 border-teal-500 text-teal-950 font-medium shadow-sm ring-1 ring-teal-400'
                    : 'bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {/* Reading Order Index Badge */}
                <div
                  className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 mt-0.5"
                  style={{
                    backgroundColor: config.bgLight,
                    color: config.textColor,
                    border: `1px solid ${config.borderColor}`,
                  }}
                  title={`Sequential Reading Order #${el.readingOrder}`}
                >
                  #{el.readingOrder}
                </div>

                {/* Semantic Tag Badge */}
                <div
                  className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold text-white shrink-0 mt-0.5 shadow-xs"
                  style={{ backgroundColor: config.color }}
                  title={`PDF Semantic Tag: <${el.tag}>`}
                >
                  {el.tag}
                </div>

                {/* Text Content Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-slate-900 font-sans text-[11.5px]">
                    {el.tag === 'Figure' ? (
                      <span className="italic text-teal-800 font-medium">
                        {el.altText ? `[Alt: ${el.altText}]` : '[⚠️ Image Needs Alt Text]'}
                      </span>
                    ) : el.tag === 'Artifact' ? (
                      <span className="text-slate-400 italic flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-slate-400 inline" />
                        {el.text || '[Decorative Header / Footer]'}
                      </span>
                    ) : (
                      el.text || `[Empty ${el.tag}]`
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                    <span>Pg {el.pageNumber}</span>
                    <span>•</span>
                    <span
                      className={`${
                        el.confidence >= 0.9
                          ? 'text-emerald-700 font-medium'
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

                {/* Node Action Icons (Visible on hover/selected) */}
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  {/* Quick-switch Tag Button */}
                  {onUpdateElement && (
                    <button
                      onClick={(e) => handleQuickTagChange(el.id, el.tag === 'Artifact' ? 'P' : 'Artifact', e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                      title={el.tag === 'Artifact' ? 'Convert back to Paragraph' : 'Convert to Decorative Artifact'}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Read aloud audition button */}
                  <button
                    onClick={(e) => handleAuditionNode(el.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Audition speech synthesis for this node"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Warning / Flag Icon */}
                  {isFlagged && (
                    <div title="Flagged for human accessibility review">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                  )}

                  {isLowConf && !isFlagged && (
                    <div title="Low AI confidence (<85%)">
                      <Flag className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk Artifact Action Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
        <button
          onClick={onBulkArtifactHeaders}
          className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          title="Auto-convert detected running headers, footers, and page numbers to Artifacts"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Auto-Artifact Running Headers & Numbers</span>
        </button>
      </div>
    </div>
  );
};
