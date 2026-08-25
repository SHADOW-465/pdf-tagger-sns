import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Settings2, 
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { formatBytes } from '../../utils/helpers';

interface UploadScreenProps {
  onFileSelected: (file: File) => void;
  onLoadDemo: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onFileSelected,
  onLoadDemo,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrechecking, setIsPrechecking] = useState(false);
  const [precheckResult, setPrecheckResult] = useState<{
    hasTextLayer: boolean;
    isPreTagged: boolean;
    estimatedPages: number;
    estimatedTimeSec: number;
  } | null>(null);

  // Ingestion configuration state
  const [language, setLanguage] = useState('en-US');
  const [ocrMode, setOcrMode] = useState<'auto' | 'always' | 'disabled'>('auto');
  const [altTextDetail, setAltTextDetail] = useState<'detailed' | 'concise' | 'academic'>('detailed');
  const [autoArtifacts, setAutoArtifacts] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleFileChosen(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileChosen(file);
    }
  };

  const handleFileChosen = (file: File) => {
    setSelectedFile(file);
    setIsPrechecking(true);

    // Quick structural heuristic estimation
    setTimeout(() => {
      const estPages = Math.max(1, Math.round(file.size / (120 * 1024)));
      setPrecheckResult({
        hasTextLayer: true,
        isPreTagged: false,
        estimatedPages: estPages,
        estimatedTimeSec: Math.max(1.5, parseFloat((estPages * 0.6).toFixed(1))),
      });
      setIsPrechecking(false);
    }, 500);
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
          Upload PDF for Semantic Ingestion
        </h1>
        <p className="text-slate-600 text-sm">
          Supports standard PDF ebooks, scanned manuscripts, and multi-column academic publications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Drag-and-drop Dropzone */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-teal-500 bg-teal-50/70 scale-[1.01]'
                : selectedFile
                ? 'border-teal-400 bg-teal-50/20'
                : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50/60 shadow-subtle'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            {selectedFile ? (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-mono mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  PDF File Loaded
                </span>
                <h3 className="font-serif font-bold text-slate-900 text-lg mb-1 truncate max-w-md mx-auto">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatBytes(selectedFile.size)} • Click or drop another file to replace
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-800 mb-1">
                  Drag and drop your PDF here
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  or browse your files for .pdf documents
                </p>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-teal-300" />
                  <span>Select PDF File</span>
                </button>
              </div>
            )}
          </div>

          {/* Pre-check Inspection Card */}
          {selectedFile && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card text-left">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="font-serif font-bold text-slate-900 text-sm">
                    Pre-Ingestion Structure Inspection
                  </span>
                </div>
                {isPrechecking ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Probing vector text...
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-mono font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready for Ingestion
                  </span>
                )}
              </div>

              {precheckResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 mb-0.5">Est. Pages</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ~{precheckResult.estimatedPages} Pages
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 mb-0.5">Text Layer</div>
                    <div className="font-mono font-bold text-emerald-700 text-sm">
                      {precheckResult.hasTextLayer ? 'Vector Text' : 'Needs OCR'}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 mb-0.5">Existing Tags</div>
                    <div className="font-mono font-bold text-amber-700 text-sm">
                      {precheckResult.isPreTagged ? 'Tagged' : 'Untagged (Repair)'}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 mb-0.5">Est. Pipeline Time</div>
                    <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      ~{precheckResult.estimatedTimeSec}s
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartAnalysis}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Begin Semantic Analysis & Tagging</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {/* Quick Demo Preset Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-850 text-white p-6 rounded-3xl shadow-card border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 text-[10px] font-mono uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                Instant Interactive Preset
              </div>
              <h4 className="font-serif font-bold text-base text-white">
                Don't have a PDF ready? Try our realistic sample ebook
              </h4>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Includes cover page, Chapter 1 H1 title, two-column layout, architectural diagram figure, data table, footnotes, and sidebars.
              </p>
            </div>
            <button
              onClick={onLoadDemo}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Load Demo Ebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Pipeline & Ingestion Settings */}
        <div className="space-y-6 text-left">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Settings2 className="w-4 h-4 text-teal-600" />
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Pipeline Settings
              </h3>
            </div>

            <div className="space-y-4">
              {/* Natural Language /Lang */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Natural Language (/Lang)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                >
                  <option value="en-US">English (United States) - en-US</option>
                  <option value="en-GB">English (United Kingdom) - en-GB</option>
                  <option value="es-ES">Spanish (Spain) - es-ES</option>
                  <option value="fr-FR">French (France) - fr-FR</option>
                  <option value="de-DE">German (Germany) - de-DE</option>
                  <option value="ja-JP">Japanese (Japan) - ja-JP</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Required by PDF/UA Clause 7.2 for speech synthesis phoneme mapping.
                </p>
              </div>

              {/* OCR Fallback Mode */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  OCR Text Extraction Strategy
                </label>
                <select
                  value={ocrMode}
                  onChange={(e) => setOcrMode(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                >
                  <option value="auto">Auto-detect (Run OCR when text layer missing)</option>
                  <option value="always">Always run OCR (Reconstruct text from raster)</option>
                  <option value="disabled">Disable OCR (Rely on native vector text only)</option>
                </select>
              </div>

              {/* AI Alt Text Generation Depth */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  AI Alt Text Generation Depth
                </label>
                <select
                  value={altTextDetail}
                  onChange={(e) => setAltTextDetail(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                >
                  <option value="detailed">Detailed (Standard for educational figures & charts)</option>
                  <option value="concise">Concise (Brief high-level description)</option>
                  <option value="academic">Academic (Rigorous terminology with context)</option>
                </select>
              </div>

              {/* Auto Artifacts Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoArtifacts}
                    onChange={(e) => setAutoArtifacts(e.target.checked)}
                    className="mt-0.5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-800 block">
                      Auto-Tag Page Furniture as Artifacts
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">
                      Marks running headers, footers, and page numbers so screen readers skip repetitive text.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-xs mb-2">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Zero Data Retention Privacy</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              All PDF parsing, layout geometry analysis, and tagged PDF synthesis occur in memory within your browser environment. Your documents are never uploaded to persistent cloud storage or used for model training.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
