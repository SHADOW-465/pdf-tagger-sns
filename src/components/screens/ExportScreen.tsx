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
  Printer,
  Eye,
  X,
  Copy,
  Check
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
  const [previewModal, setPreviewModal] = useState<{ title: string; content: string; language: string } | null>(null);
  const [copied, setCopied] = useState(false);

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

      setDownloadSuccess('Standards-compliant Tagged PDF exported successfully!');
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

  const handlePreviewJson = () => {
    const jsonStr = exportStructuredJson(document);
    setPreviewModal({
      title: 'Structure Tree JSON AST Preview',
      content: jsonStr,
      language: 'json',
    });
  };

  const handlePreviewXhtml = () => {
    const xhtmlStr = exportEpubXhtml(document);
    setPreviewModal({
      title: 'EPUB-Ready Semantic XHTML Preview',
      content: xhtmlStr,
      language: 'html',
    });
  };

  const handleCopyCode = () => {
    if (previewModal) {
      navigator.clipboard.writeText(previewModal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const score = document.validationReport.overallScore;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Validated for Publication & Distribution</span>
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
        {/* Deliverable 1: Accessible Tagged PDF */}
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
              Complete PDF publication embedded with Document Structure Tree (`/StructTreeRoot`), `/MarkInfo`, language tags, and standard role mappings.
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

        {/* Deliverable 2: Accessibility Audit Certificate */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              Accessibility Audit Certificate
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Official audit certificate documenting WCAG 2.1 AA and ISO 14289-1 checklist compliance, tag distribution, and verification hash.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">PDF/UA Matrix</span>
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

        {/* Deliverable 3: Structured JSON AST */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <Code className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              Extracted Structure JSON
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Complete AST with bounding boxes, tag roles, confidence scores, and reading order sequence for downstream CMS pipelines.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">JSON Schema v2.0</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">{document.elements.length} Nodes</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviewJson}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Deliverable 4: EPUB-Ready Semantic XHTML */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card flex flex-col justify-between group hover:shadow-float transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              EPUB-Ready Semantic XHTML
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Clean HTML5/XHTML article markup with semantic headers, tables, figures, footnotes, and sidebars ready for EPUB3 ebook packaging.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">EPUB3 Standard</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">XHTML5</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviewXhtml}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleDownloadEpubXhtml}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download XHTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Audition & Reset Action Bar */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-slate-900">
              Audition Screen Reader Voice Synthesis
            </div>
            <div className="text-[11px] text-slate-500">
              Listen to how NVDA, JAWS, and VoiceOver speak this tagged publication in real time.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScreenReader}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Launch Voice Simulator</span>
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

      {/* Code Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#0b1626] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-400" />
                <h3 className="font-serif font-bold text-sm text-white">
                  {previewModal.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs max-h-[65vh]">
              <pre className="whitespace-pre-wrap break-words">{previewModal.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
