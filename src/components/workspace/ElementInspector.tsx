import React from 'react';
import { 
  Sliders, 
  Volume2, 
  Sparkles, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Flag
} from 'lucide-react';
import type { PdfElement, PdfTagType } from '../../types/pdf';
import { TAG_CONFIGS } from '../../utils/helpers';
import { generateAiAltText } from '../../services/altTextGenerator';
import { screenReaderService } from '../../services/speechSynthesizer';

interface ElementInspectorProps {
  element: PdfElement | null;
  allElements: PdfElement[];
  onUpdateElement: (updated: PdfElement) => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  allElements,
  onUpdateElement,
}) => {
  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 bg-white select-none">
        <Sliders className="w-10 h-10 text-slate-300 mb-3" />
        <h3 className="font-serif font-bold text-slate-700 text-sm mb-1">
          No Element Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Click any bounding box on the PDF canvas or select a node in the structure tree to inspect and repair accessibility tags.
        </p>
      </div>
    );
  }

  const config = TAG_CONFIGS[element.tag] || TAG_CONFIGS.P;
  const isFigure = element.tag === 'Figure';
  const isTable = element.tag === 'Table';

  const handleTagChange = (newTag: PdfTagType) => {
    let updated: PdfElement = {
      ...element,
      tag: newTag,
      confidence: 1.0, // Manual human tagging has 100% confidence
      isFlaggedForReview: false,
    };

    if (newTag === 'Artifact') {
      updated.isDecorative = true;
    } else if (newTag === 'Figure' && !updated.altText) {
      updated.aiAltTextSuggested = generateAiAltText(updated, allElements);
    }

    onUpdateElement(updated);
  };

  const handleGenerateAltText = () => {
    const aiText = generateAiAltText(element, allElements);
    onUpdateElement({
      ...element,
      altText: aiText,
      isFlaggedForReview: false,
    });
  };

  const handleAuditionSpeech = () => {
    screenReaderService.playFromElement(element.id);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-mono font-bold"
              style={{
                backgroundColor: config.color,
                color: '#ffffff',
              }}
            >
              {element.tag}
            </span>
            <span className="font-mono text-xs text-slate-500 font-semibold">
              Order #{element.readingOrder}
            </span>
          </div>

          {/* Single element Read Aloud button */}
          <button
            onClick={handleAuditionSpeech}
            className="flex items-center gap-1 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium border border-teal-200 transition-colors"
            title="Audition speech synthesis for this element"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Audition</span>
          </button>
        </div>

        {/* Confidence Progress Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
          <span>AI Tag Confidence</span>
          <span
            className={`font-bold ${
              element.confidence >= 0.9
                ? 'text-emerald-700'
                : element.confidence >= 0.8
                ? 'text-teal-700'
                : 'text-amber-700'
            }`}
          >
            {Math.round(element.confidence * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              element.confidence >= 0.9
                ? 'bg-emerald-500'
                : element.confidence >= 0.8
                ? 'bg-teal-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${element.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Main Inspector Fields */}
      <div className="p-4 space-y-5 text-left flex-1">
        {/* 1. Tag Selector */}
        <div>
          <label className="block text-xs font-serif font-bold text-slate-800 mb-1.5">
            Semantic PDF Tag Type
          </label>
          <select
            value={element.tag}
            onChange={(e) => handleTagChange(e.target.value as PdfTagType)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all"
          >
            <optgroup label="Headings">
              <option value="H1">H1 — Book Title / Chapter Title</option>
              <option value="H2">H2 — Section Heading</option>
              <option value="H3">H3 — Subsection Heading</option>
              <option value="H4">H4 — Level 4 Heading</option>
              <option value="H5">H5 — Level 5 Heading</option>
              <option value="H6">H6 — Level 6 Heading</option>
            </optgroup>
            <optgroup label="Text & Flow">
              <option value="P">P — Paragraph Body Text</option>
              <option value="Quote">Quote — Blockquote / Excerpt</option>
              <option value="Footnote">Footnote — Note or Citation</option>
              <option value="Sidebar">Sidebar — Callout Box</option>
              <option value="Link">Link — Interactive Hyperlink</option>
            </optgroup>
            <optgroup label="Lists & Tables">
              <option value="ListItem">ListItem (LI) — Bullet / Numbered Item</option>
              <option value="List">List — List Container Block</option>
              <option value="Table">Table — Tabular Data Matrix</option>
              <option value="TH">TH — Table Header Cell</option>
              <option value="TD">TD — Table Data Cell</option>
            </optgroup>
            <optgroup label="Media & Figures">
              <option value="Figure">Figure — Graphic / Image requiring Alt Text</option>
              <option value="Caption">Caption — Figure / Table Label</option>
            </optgroup>
            <optgroup label="Decorative / Excluded">
              <option value="Artifact">Artifact — Decorative art, Header, Page Number</option>
            </optgroup>
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            {config.shortDesc}
          </p>
        </div>

        {/* 2. Figure / Image Alt Text Inspector */}
        {isFigure && (
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-teal-950">
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>Image Alternative Text (WCAG 1.1.1)</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAltText}
                className="flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-300 shadow-sm transition-all"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>AI Suggest</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={element.altText || ''}
              onChange={(e) =>
                onUpdateElement({
                  ...element,
                  altText: e.target.value,
                  isFlaggedForReview: false,
                })
              }
              placeholder="Provide a clear, descriptive explanation of this figure for screen reader users..."
              className="w-full text-xs bg-white border border-teal-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-500 font-sans"
            />

            {/* Decorative toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={!!element.isDecorative}
                onChange={(e) =>
                  onUpdateElement({
                    ...element,
                    isDecorative: e.target.checked,
                    altText: e.target.checked ? '' : element.altText,
                  })
                }
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Mark as purely decorative (Screen reader will skip)</span>
            </label>
          </div>
        )}

        {/* 3. Table Structure Inspector */}
        {isTable && element.tableData && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-amber-950">
              <TableIcon className="w-4 h-4 text-amber-700" />
              <span>Table Matrix Structure</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.tableData.hasHeaderRow}
                  onChange={(e) =>
                    onUpdateElement({
                      ...element,
                      tableData: {
                        ...element.tableData!,
                        hasHeaderRow: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Header Row (TH)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.tableData.hasHeaderCol}
                  onChange={(e) =>
                    onUpdateElement({
                      ...element,
                      tableData: {
                        ...element.tableData!,
                        hasHeaderCol: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Header Col (TH)</span>
              </label>
            </div>

            <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-amber-200">
              {element.tableData.rowCount} Rows • {element.tableData.colCount} Columns • {element.tableData.cells.length} Structured Cells
            </div>
          </div>
        )}

        {/* 4. Extracted Text Content */}
        <div>
          <label className="block text-xs font-serif font-bold text-slate-800 mb-1.5">
            Extracted Content Text
          </label>
          <textarea
            rows={5}
            value={element.text}
            onChange={(e) =>
              onUpdateElement({
                ...element,
                text: e.target.value,
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed transition-all"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Page {element.pageNumber} Coordinates</span>
            <span>{element.text.length} chars</span>
          </div>
        </div>

        {/* 5. Flag for Human Review Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Flag className={`w-4 h-4 ${element.isFlaggedForReview ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-800">
                Flag for Human Review
              </span>
            </div>
            <input
              type="checkbox"
              checked={element.isFlaggedForReview}
              onChange={(e) =>
                onUpdateElement({
                  ...element,
                  isFlaggedForReview: e.target.checked,
                })
              }
              className="rounded text-amber-600 focus:ring-amber-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
