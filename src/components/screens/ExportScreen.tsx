import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Download, 
  FileCheck2, 
  Code, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw,
  Volume2,
  Printer
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';
import { 
  exportAccessibleTaggedPdf, 
  exportStructuredJson, 
  exportEpubXhtml 
} from '../../services/pdfExportEngine';

interface ExportScreenProps {
  document: EbookDocument;
  onReset: () => void;
  onOpenScreenReader: () => void;
  onOpenAuditPreview: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({
  document,
  onReset,
  onOpenScreenReader,
  onOpenAuditPreview,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const blob = await exportAccessibleTaggedPdf(document);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.fileName.replace(/\.pdf$/i, '')}_accessible_tagged.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0f766e', '#14b8a6', '#0284c7', '#38bdf8'],
      });

      setDownloadSuccess('Tagged PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJson = () => {
    const jsonStr = exportStructuredJson(document);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.fileName.replace(/\.pdf$/i, '')}_structure.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Structure JSON exported!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadEpubXhtml = () => {
    const xhtmlStr = exportEpubXhtml(document);
    const blob = new Blob([xhtmlStr], { type: 'application/xhtml+xml' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.fileName.replace(/\.pdf$/i, '')}_epub_content.xhtml`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('EPUB-ready XHTML exported!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const score = document.validationReport.overallScore;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ready for Publication & Distribution</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
          Export Accessible Document Package
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Download your standards-compliant Tagged PDF, audit certificate, and structured interchange formats.
        </p>
      </div>

      {downloadSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center shadow-sm flex items-center justify-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main 4 Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Option 1: Accessible Tagged PDF */}
        <div className="bg-white rounded-3xl p-7 border-2 border-teal-500 shadow-float relative flex flex-col justify-between group">
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
            Primary Deliverable
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              Accessible Tagged PDF (PDF/UA)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Complete PDF document embedded with a standard Document Structure Tree (`/StructTreeRoot`), `/MarkInfo`, language tags, and bookmarks outline.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">ISO 14289-1</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">WCAG 2.1 AA</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-100 text-teal-800 font-bold">{score}% Score</span>
            </div>
          </div>

          <button
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download Tagged PDF'}</span>
          </button>
        </div>

        {/* Option 2: Accessibility Audit Certificate */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              Accessibility Audit Certificate
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Formal audit report detailing WCAG 2.1 Level AA compliance, heading continuity, alt-text coverage, table header scoping, and tag distribution.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">PDF/UA Checklist</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">Printable Certificate</span>
            </div>
          </div>

          <button
            onClick={onOpenAuditPreview}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>View & Print Audit Certificate</span>
          </button>
        </div>

        {/* Option 3: Structured JSON AST */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <Code className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              Extracted Structure JSON
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Raw AST and layout geometry metadata with bounding boxes, tag roles, confidence scores, and reading sequences for downstream CMS pipelines.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">JSON Schema v2.0</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">{document.elements.length} Nodes</span>
            </div>
          </div>

          <button
            onClick={handleDownloadJson}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Download Structure JSON</span>
          </button>
        </div>

        {/* Option 4: EPUB-Ready Semantic XHTML */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              EPUB-Ready Semantic XHTML
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Clean HTML5/XHTML article markup with semantic headers, tables, figures, footnotes, and sidebars ready for packaging into EPUB3 ebooks.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">EPUB3 Compatible</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">XHTML5</span>
            </div>
          </div>

          <button
            onClick={handleDownloadEpubXhtml}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Download EPUB XHTML</span>
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-slate-900">
              Want to hear how screen readers speak this tagged document?
            </div>
            <div className="text-[11px] text-slate-500">
              Launch the built-in Read Aloud audio simulator with synchronized visual highlights.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScreenReader}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen to Read Aloud</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-subtle transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tag Another Ebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};
