import React, { useState } from 'react';
import { 
  Sliders, 
  Volume2, 
  Sparkles, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Flag,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react';
import type { PdfElement, PdfTagType } from '../../types/pdf';
import { TAG_CONFIGS, checkSkippedHeading, formatSpeechAnnouncement } from '../../utils/helpers';
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
  const [isAuditioning, setIsAuditioning] = useState(false);

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 bg-white select-none">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <Sliders className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="font-serif font-bold text-slate-700 text-sm mb-1">
          No Element Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Click any bounding box on the PDF canvas or select an item from the Structure Tree to inspect and edit semantic accessibility tags.
        </p>
      </div>
    );
  }

  const config = TAG_CONFIGS[element.tag] || TAG_CONFIGS.P;
  const isFigure = element.tag === 'Figure';
  const isTable = element.tag === 'Table';
  const isLink = element.tag === 'Link';

  // Check for skipped heading levels
  const headingCheck = checkSkippedHeading(element, allElements);

  const handleTagChange = (newTag: PdfTagType) => {
    let updated: PdfElement = {
      ...element,
      tag: newTag,
      confidence: 1.0, // Human manual edit grants 100% confidence
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
    setIsAuditioning(true);
    screenReaderService.playFromElement(element.id);
    setTimeout(() => setIsAuditioning(false), 2000);
  };

  const announcementPreview = formatSpeechAnnouncement(element);

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto font-sans">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded text-xs font-mono font-bold shadow-xs text-white"
              style={{ backgroundColor: config.color }}
            >
              {element.tag}
            </span>
            <span className="font-mono text-xs text-slate-600 font-semibold">
              Order #{element.readingOrder}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-xs text-slate-500">
              Page {element.pageNumber}
            </span>
          </div>

          {/* Audition Speech Button */}
          <button
            onClick={handleAuditionSpeech}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              isAuditioning
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 shadow-xs'
            }`}
            title="Audition synthesized voice announcement for this element"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Audition</span>
          </button>
        </div>

        {/* AI Confidence Meter */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
            <span>Semantic Tag Confidence</span>
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
              className={`h-full rounded-full transition-all duration-300 ${
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
      </div>

      {/* Skipped Heading Alert Banner */}
      {headingCheck.isSkipped && headingCheck.expectedTag && (
        <div className="m-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-serif font-bold text-amber-900">
                Heading Hierarchy Skip Detected
              </div>
              <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                WCAG 1.3.1 requires headings to follow sequential hierarchy. Found <code className="font-mono font-bold">{element.tag}</code> after <code className="font-mono font-bold">{headingCheck.prevHeadingTag || 'start'}</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleTagChange(headingCheck.expectedTag!)}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] shadow-xs shrink-0"
          >
            Fix to {headingCheck.expectedTag}
          </button>
        </div>
      )}

      {/* Main Inspector Form Sections */}
      <div className="p-4 space-y-5 text-left flex-1">
        {/* 1. Categorical Tag Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-serif font-bold text-slate-800">
              PDF Semantic Tag
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              Hotkey: [{config.shortcutKey}]
            </span>
          </div>

          <select
            value={element.tag}
            onChange={(e) => handleTagChange(e.target.value as PdfTagType)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all mb-2"
          >
            <optgroup label="Headings & Structure">
              <option value="H1">H1 — Book Title / Chapter Title [1]</option>
              <option value="H2">H2 — Major Section Heading [2]</option>
              <option value="H3">H3 — Subsection Heading [3]</option>
              <option value="H4">H4 — Level 4 Heading [4]</option>
              <option value="H5">H5 — Level 5 Heading [5]</option>
              <option value="H6">H6 — Level 6 Heading [6]</option>
            </optgroup>
            <optgroup label="Text & Flow">
              <option value="P">P — Paragraph Body Text [P]</option>
              <option value="Quote">Quote — Blockquote / Excerpt [Q]</option>
              <option value="Footnote">Footnote — Citation or Footnote [N]</option>
              <option value="Sidebar">Sidebar — Callout Box [S]</option>
              <option value="Link">Link — Interactive Hyperlink [K]</option>
            </optgroup>
            <optgroup label="Lists & Tabular">
              <option value="ListItem">ListItem (LI) — Bullet / Numbered Item [L]</option>
              <option value="List">List — List Container Block [O]</option>
              <option value="Table">Table — Tabular Data Matrix [T]</option>
              <option value="TH">TH — Table Header Cell [H]</option>
              <option value="TD">TD — Table Data Cell [D]</option>
            </optgroup>
            <optgroup label="Media & Figures">
              <option value="Figure">Figure — Graphic / Image [F]</option>
              <option value="Caption">Caption — Figure / Table Label [C]</option>
            </optgroup>
            <optgroup label="Decorative / Excluded">
              <option value="Artifact">Artifact — Decorative header, footer, page number [A]</option>
            </optgroup>
          </select>

          {/* Quick Tag Pill Bar */}
          <div className="flex flex-wrap gap-1">
            {(['H1', 'H2', 'H3', 'P', 'Figure', 'Table', 'ListItem', 'Artifact'] as const).map((quickTag) => {
              const qConfig = TAG_CONFIGS[quickTag];
              const isCurrent = element.tag === quickTag;
              return (
                <button
                  key={quickTag}
                  onClick={() => handleTagChange(quickTag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  style={{
                    borderColor: isCurrent ? qConfig.color : undefined,
                    borderWidth: isCurrent ? '1px' : '0px',
                  }}
                >
                  {quickTag}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-1.5">
            {config.shortDesc}
          </p>
        </div>

        {/* 2. Figure / Image Alt-Text Studio */}
        {isFigure && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-teal-950">
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>Image Alternative Text (WCAG 1.1.1)</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAltText}
                className="flex items-center gap-1 text-[11px] font-medium text-teal-800 hover:text-teal-950 bg-white px-2.5 py-1 rounded-lg border border-teal-300 shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
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
              placeholder="Describe what this diagram or graphic communicates..."
              className="w-full text-xs bg-white border border-teal-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-teal-500 font-sans"
            />

            <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
              <span>{element.altText?.length || 0} characters</span>
              {element.altText && element.altText.length > 200 && (
                <span className="text-amber-700 font-medium">Consider concise summary</span>
              )}
            </div>

            {/* Decorative toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 pt-1 border-t border-teal-200/60">
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
              <span>Mark as decorative graphic (Ignored by screen readers)</span>
            </label>
          </div>
        )}

        {/* 3. Table Matrix Structure Studio */}
        {isTable && element.tableData && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 shadow-subtle">
            <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-amber-950">
              <TableIcon className="w-4 h-4 text-amber-700" />
              <span>Table Matrix Structure (WCAG 1.3.1)</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-700">
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
                <span className="font-medium">First Row is Header (&lt;TH&gt;)</span>
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
                <span className="font-medium">First Col is Header (&lt;TH&gt;)</span>
              </label>
            </div>

            {/* Table Caption Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Table Caption / Summary
              </label>
              <input
                type="text"
                value={element.tableData.caption || ''}
                onChange={(e) =>
                  onUpdateElement({
                    ...element,
                    tableData: {
                      ...element.tableData!,
                      caption: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Table 1.1: Experimental Parameters"
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Matrix Cell Preview Grid */}
            <div className="bg-white p-2 rounded-xl border border-amber-200 overflow-x-auto max-h-36">
              <table className="w-full text-[10.5px] border-collapse">
                <tbody>
                  {Array.from({ length: element.tableData.rowCount }).map((_, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-b-0">
                      {Array.from({ length: element.tableData!.colCount }).map((_, cIdx) => {
                        const cell = element.tableData!.cells.find(
                          (c) => c.rowIndex === rIdx && c.colIndex === cIdx
                        );
                        const isHeader = (rIdx === 0 && element.tableData!.hasHeaderRow) || (cIdx === 0 && element.tableData!.hasHeaderCol);
                        return (
                          <td
                            key={cIdx}
                            className={`p-1 border-r border-slate-100 last:border-r-0 truncate max-w-[100px] ${
                              isHeader ? 'bg-amber-100/70 font-bold text-amber-950' : 'text-slate-700'
                            }`}
                          >
                            {cell ? cell.text : `R${rIdx}C${cIdx}`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Link Destination Inspector */}
        {isLink && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-blue-950">
              <LinkIcon className="w-4 h-4 text-blue-700" />
              <span>Link URL Destination (PDF/UA 7.8)</span>
            </div>
            <input
              type="text"
              value={element.linkUrl || ''}
              onChange={(e) =>
                onUpdateElement({
                  ...element,
                  linkUrl: e.target.value,
                })
              }
              placeholder="https://example.com or internal bookmark"
              className="w-full text-xs bg-white border border-blue-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 5. Extracted Text Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-serif font-bold text-slate-800">
              Extracted Content Text
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {element.text.length} chars
            </span>
          </div>

          <textarea
            rows={4}
            value={element.text}
            onChange={(e) =>
              onUpdateElement({
                ...element,
                text: e.target.value,
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed transition-all"
          />
        </div>

        {/* 6. Screen Reader Live Utterance Preview */}
        <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-teal-400 text-[10.5px]">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Screen Reader Spoken Output</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug break-words">
            "{announcementPreview}"
          </p>
        </div>

        {/* 7. Flag for Human Review Toggle */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200">
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

          {element.isFlaggedForReview && (
            <input
              type="text"
              value={element.reviewNotes || ''}
              onChange={(e) =>
                onUpdateElement({
                  ...element,
                  reviewNotes: e.target.value,
                })
              }
              placeholder="Add review note (e.g., verify formula rendering)..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};
