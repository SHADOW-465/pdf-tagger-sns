import React from 'react';
import { 
  BookOpen, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { EbookDocument } from '../../types/pdf';

export type AppStep = 'landing' | 'upload' | 'analysis' | 'workspace' | 'validation' | 'export';

interface NavbarProps {
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  document: EbookDocument | null;
  onOpenScreenReader: () => void;
  isAudioPlaying?: boolean;
  onReset: () => void;
  onLoadDemo: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigate,
  document,
  onOpenScreenReader,
  isAudioPlaying = false,
  onReset,
  onLoadDemo,
  onOpenShortcuts,
}) => {
  const steps: { key: AppStep; label: string; number: number; disabled: boolean }[] = [
    { key: 'upload', label: 'Upload', number: 1, disabled: false },
    { key: 'analysis', label: 'Analysis', number: 2, disabled: !document },
    { key: 'workspace', label: 'Review & Tag', number: 3, disabled: !document },
    { key: 'validation', label: 'Validation', number: 4, disabled: !document },
    { key: 'export', label: 'Export', number: 5, disabled: !document },
  ];

  const score = document?.validationReport?.overallScore ?? 0;
  const isHighQuality = score >= 90;
  const errorCount = document?.validationReport?.errorChecks ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0b1626] border-b border-slate-800 text-white shadow-card select-none">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg p-1 transition-all"
            aria-label="Go to home landing screen"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-teal-200 transition-colors">
                  Accessible Ebook
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-900/90 text-teal-300 border border-teal-700/60">
                  Tagger
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans tracking-wide">
                ISO 14289-1 (PDF/UA) & WCAG 2.1 AA
              </p>
            </div>
          </button>
        </div>

        {/* Pipeline Steps Breadcrumbs */}
        {currentStep !== 'landing' && (
          <nav aria-label="Ingestion Pipeline Progress" className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {steps.map((s, index) => {
              const isActive = currentStep === s.key;
              const currentIndex = steps.findIndex((x) => x.key === currentStep);
              const isPast = document && currentIndex > index;

              return (
                <button
                  key={s.key}
                  disabled={s.disabled}
                  onClick={() => onNavigate(s.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm font-semibold'
                      : isPast
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : s.disabled
                      ? 'text-slate-600 cursor-not-allowed opacity-60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-white text-teal-900 shadow-xs'
                        : isPast
                        ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.number}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {document ? (
            <>
              {/* Compliance Score Pill */}
              <button
                onClick={() => onNavigate('validation')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                  isHighQuality
                    ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/80 shadow-xs'
                    : 'bg-amber-950/80 border-amber-600/70 text-amber-300 hover:bg-amber-900/80 shadow-xs'
                }`}
                title="View Detailed Accessibility Scorecard"
                aria-label={`Current compliance score: ${score}%. Click to view audit.`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-bold">{score}%</span>
                {errorCount > 0 && (
                  <span className="px-1 py-0.2 rounded text-[10px] bg-rose-900/80 text-rose-200 flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {errorCount}
                  </span>
                )}
              </button>

              {/* Read Aloud Audio Simulator Button */}
              <button
                onClick={onOpenScreenReader}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                  isAudioPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-teal-700 hover:bg-teal-600 text-white border border-teal-500/50'
                }`}
                title="Simulate Screen Reader Voice Synthesis"
                aria-label="Open Assistive Voice Simulator"
              >
                {isAudioPlaying ? (
                  <div className="flex items-center gap-0.5 h-3.5">
                    <span className="w-1 bg-white rounded-full animate-equalizer-1"></span>
                    <span className="w-1 bg-white rounded-full animate-equalizer-2"></span>
                    <span className="w-1 bg-white rounded-full animate-equalizer-3"></span>
                    <span className="w-1 bg-white rounded-full animate-equalizer-4"></span>
                  </div>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isAudioPlaying ? 'Voice Active...' : 'Voice Test'}
                </span>
              </button>

              {/* Reset/New PDF Button */}
              <button
                onClick={onReset}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Upload Another PDF Ebook"
                aria-label="Upload Another PDF Ebook"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Load Demo Ebook</span>
            </button>
          )}

          {/* Keyboard Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Keyboard Navigation Shortcuts (?)"
            aria-label="Keyboard Shortcuts and Accessibility Information"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
