import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  Volume2, 
  Eye, 
  ListTree, 
  ArrowRight,
  Compass,
  Cpu,
  Lock
} from 'lucide-react';

interface LandingScreenProps {
  onUploadClick: () => void;
  onLoadDemo: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onUploadClick,
  onLoadDemo,
}) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1626] via-[#0f2138] to-[#122844] text-white pt-14 pb-20 px-6">
        {/* Subtle decorative grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Compliance Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/90 border border-teal-500/50 text-teal-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>ISO 14289-1 (PDF/UA) & WCAG 2.1 AA Tagging</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6">
            Turn standard PDF publications into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300">
              accessible, read-aloud-ready
            </span>{' '}
            ebooks.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed mb-10">
            Automatically detect headings, multi-column layouts, tables, and figures. Repair reading order, synthesize context-aware AI alt text, audition assistive voice synthesis, and export standards-compliant Tagged PDFs with zero server data retention.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <button
              onClick={onLoadDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm sm:text-base shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group"
            >
              <Sparkles className="w-5 h-5 text-teal-200 group-hover:rotate-12 transition-transform" />
              <span>Load Interactive Demo Ebook</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onUploadClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm sm:text-base border border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-5 h-5 text-slate-300" />
              <span>Upload Custom PDF</span>
            </button>
          </div>

          {/* Trust stats grid */}
          <div className="mt-14 pt-8 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-700/50 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
                <ListTree className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-serif">StructTreeRoot</div>
                <div className="text-slate-400 text-xs">Real PDF tag hierarchy</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-xs">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-serif">Read Aloud Sync</div>
                <div className="text-slate-400 text-xs">Live audio simulator</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-serif">AI Alt Text & OCR</div>
                <div className="text-slate-400 text-xs">Scanned pages & charts</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-300 shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-serif">100% Client-Side</div>
                <div className="text-slate-400 text-xs">In-memory privacy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 bg-[#f8fafc] flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-3">
              Engineered for Complete Standards Conformance
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Built for academic publishers, university librarians, digital archivists, and government accessibility compliance teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:shadow-float transition-all group text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <ListTree className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Semantic Structure Tree
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Infers complete document architecture: H1 chapter titles, H2–H6 section headings, multi-paragraph bodies, nested lists, table data matrices, and sidebars.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200">H1-H6</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200">Table (TH/TD)</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-700 border border-amber-200">Lists</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:shadow-float transition-all group text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Multi-Column Reading Order
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Spatial topological analysis prevents multi-column text interleaving. Reorder elements in the review tree to resolve ambiguous sequence branches.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 text-teal-700 border border-teal-200">Topological Sort</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">Visual Flow Lines</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:shadow-float transition-all group text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                AI Alt Text & Artifact Tagging
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Generates context-aware descriptions for scientific figures and diagrams, while cleanly tagging running headers, footers, and page numbers as decorative Artifacts.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">WCAG 1.1.1</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">Artifact Exclusions</span>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Launch Box */}
          <div className="mt-12 bg-gradient-to-r from-navy-900 to-navy-850 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-card border border-slate-800 text-left">
            <div>
              <h4 className="font-serif text-2xl font-bold mb-1">
                Experience the 3-Pane Power Workspace
              </h4>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Inspect bounding boxes on the PDF canvas, reorder reading trees, audition speech synthesis, and verify compliance scores in real time.
              </p>
            </div>
            <button
              onClick={onLoadDemo}
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Workspace</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
