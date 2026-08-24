import React from 'react';
import { 
  BookOpen, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  RotateCcw
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
  isAudioPlaying,
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

  return (
    <header className="sticky top-0 z-40 bg-[#0b1626] border-b border-navy-800 text-white shadow-card">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            aria-label="Go to home"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md text-white">
              <BookOpen className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg tracking-tight text-white">
                  Accessible Ebook
                </span>
                <span className="text-xs uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-teal-900/70 text-teal-300 border border-teal-700/50">
                  Tagger
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                PDF/UA & WCAG 2.1 AA Compliant
              </p>
            </div>
          </button>
        </div>

        {/* Pipeline Steps Breadcrumbs */}
        {currentStep !== 'landing' && (
          <nav aria-label="Pipeline Progress" className="hidden md:flex items-center gap-1 bg-navy-900/80 p-1 rounded-xl border border-slate-700/50">
            {steps.map((s, index) => {
              const isActive = currentStep === s.key;
              const isPast = document && steps.findIndex((x) => x.key === currentStep) > index;
              return (
                <button
                  key={s.key}
                  disabled={s.disabled}
                  onClick={() => onNavigate(s.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm font-semibold'
                      : isPast
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : s.disabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isActive
                        ? 'bg-white text-teal-800 font-bold'
                        : isPast
                        ? 'bg-slate-700 text-teal-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {s.number}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {document ? (
            <>
              {/* Score pill */}
              <button
                onClick={() => onNavigate('validation')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                  isHighQuality
                    ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-600/60 text-amber-300'
                }`}
                title="View Accessibility Audit Scorecard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Score: {score}%</span>
              </button>

              {/* Read Aloud Simulator Button */}
              <button
                onClick={onOpenScreenReader}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                  isAudioPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-teal-700 hover:bg-teal-600 text-white border border-teal-500/40'
                }`}
                title="Test with Screen Reader Audio Simulator"
                aria-label="Open Read Aloud Screen Reader Simulator"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isAudioPlaying ? 'Speaking...' : 'Read Aloud Test'}
                </span>
              </button>

              {/* Reset/New File */}
              <button
                onClick={onReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Upload Another PDF"
                aria-label="Upload Another PDF"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-teal-700 hover:bg-teal-600 text-white shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo Ebook</span>
            </button>
          )}

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Keyboard Shortcuts & Accessibility Info"
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
