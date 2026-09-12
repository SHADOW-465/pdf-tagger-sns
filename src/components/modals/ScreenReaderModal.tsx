import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Terminal,
  Activity,
  Minimize2,
  Maximize2,
  BookOpen
} from 'lucide-react';
import type { EbookDocument, PdfElement } from '../../types/pdf';
import { 
  screenReaderService, 
  type SpeechTranscriptItem 
} from '../../services/speechSynthesizer';
import { TAG_CONFIGS } from '../../utils/helpers';

interface ScreenReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EbookDocument;
  onSelectElement: (elementId: string) => void;
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;
}

export const ScreenReaderModal: React.FC<ScreenReaderModalProps> = ({
  isOpen,
  onClose,
  document,
  onSelectElement,
  currentPage: externalCurrentPage,
  onPageChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeElement, setActiveElement] = useState<PdfElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [transcripts, setTranscripts] = useState<SpeechTranscriptItem[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [rate, setRate] = useState(1.05);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(externalCurrentPage || 1);

  // Keep selectedPage in sync if externalCurrentPage changes
  useEffect(() => {
    if (externalCurrentPage) {
      setSelectedPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  // Keep elements synced with service
  useEffect(() => {
    if (!isOpen) return;

    screenReaderService.setElements(document.elements);
    
    // Load speech voices
    const loadVoices = () => {
      const availableVoices = screenReaderService.getAvailableVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceUri) {
        setSelectedVoiceUri(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Subscribe with multi-subscriber clean cleanup
    const unsubscribe = screenReaderService.subscribe({
      onActiveElementChange: (el, idx, total) => {
        setActiveElement(el);
        setActiveIdx(idx);
        setTotalCount(total);
        if (el) {
          setSelectedPage(el.pageNumber);
          onSelectElement(el.id);
        }
      },
      onTranscriptUpdate: (item) => {
        setTranscripts((prev) => [...prev.slice(-40), item]);
      },
      onStateChange: (playing, paused) => {
        setIsPlaying(playing);
        setIsPaused(paused);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, document.elements, onSelectElement, selectedVoiceUri]);

  if (!isOpen) return null;

  const handlePlay = () => {
    if (isPaused) {
      screenReaderService.resume();
    } else {
      // If user selected a specific page, play starting from that page
      if (selectedPage && selectedPage > 1) {
        screenReaderService.playFromPage(selectedPage);
      } else {
        screenReaderService.playFromStart();
      }
    }
  };

  const handlePause = () => {
    screenReaderService.pause();
  };

  const handleStop = () => {
    screenReaderService.stop();
  };

  const handleNext = () => {
    screenReaderService.next();
  };

  const handlePrev = () => {
    screenReaderService.previous();
  };

  const handlePageSelectChange = (pageNum: number) => {
    setSelectedPage(pageNum);
    if (onPageChange) {
      onPageChange(pageNum);
    }
    // If playing or user specifically jumps, cue from that page
    if (isPlaying && !isPaused) {
      screenReaderService.playFromPage(pageNum);
    }
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceUri(uri);
    const chosen = voices.find((v) => v.voiceURI === uri) || null;
    screenReaderService.setVoiceConfig({ voice: chosen });
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    screenReaderService.setVoiceConfig({ rate: newRate });
  };

  // Minimized Floating Player Dock (Bottom-Right)
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right font-sans">
        <div className="bg-[#0b1626] text-white rounded-2xl border border-slate-700 shadow-2xl p-3.5 flex items-center gap-3 backdrop-blur-md max-w-md">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Volume2 className="w-4 h-4" />
          </div>

          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold truncate">Voice Test</span>
              {isPlaying && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isPaused ? 'bg-amber-900/80 text-amber-300' : 'bg-emerald-900/80 text-emerald-300 animate-pulse'
                }`}>
                  {isPaused ? 'PAUSED' : 'LIVE'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-[170px]">
              {activeElement ? `P.${activeElement.pageNumber} • ${activeElement.tag}: ${activeElement.text || 'Element'}` : 'Idle'}
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {isPlaying && !isPaused ? (
              <button
                onClick={handlePause}
                className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
                title="Pause voice"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs"
                title="Play/Resume voice"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              disabled={!isPlaying}
              onClick={handleStop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 disabled:opacity-40"
              title="Stop voice"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Maximize Voice Test Window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Close Voice Test"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0b1626] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">
                  Assistive Screen Reader Simulator
                </h3>
                {isPlaying && (
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-bold">
                    <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                    LIVE AUDIO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                NVDA / JAWS / Apple VoiceOver semantic announcement emulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Minimize to floating widget (allows you to navigate & edit pages)"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Minimize</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Active Speaking Element Box */}
          <div className="bg-gradient-to-r from-teal-50 to-slate-50 p-5 rounded-2xl border border-teal-200 shadow-subtle">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>Current Spoken Entity</span>
              <span>
                {activeElement ? `Element ${activeIdx + 1} of ${totalCount}` : 'Standby'}
              </span>
            </div>

            {activeElement ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-mono font-bold text-white shadow-xs"
                    style={{
                      backgroundColor: TAG_CONFIGS[activeElement.tag]?.color || '#0f766e',
                    }}
                  >
                    {activeElement.tag}
                  </span>
                  <span className="font-mono text-xs text-slate-600 font-semibold">
                    Page {activeElement.pageNumber} • Order #{activeElement.readingOrder}
                  </span>
                </div>
                <p className="text-sm font-serif font-semibold text-navy-950 leading-snug">
                  {activeElement.text || (activeElement.altText ? `[Graphic Figure: ${activeElement.altText}]` : '[Graphic Figure]')}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-2">
                Press "Play" to start synthesizing speech sequentially through the document structure tree.
              </div>
            )}
          </div>

          {/* Player Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200">
            {/* Playback Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                disabled={activeIdx <= 0 || !isPlaying}
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs border border-slate-200 transition-colors"
                title="Previous Element"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {isPlaying && !isPaused ? (
                <button
                  onClick={handlePause}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>{isPaused ? 'Resume' : selectedPage > 1 ? `Play Page ${selectedPage}` : 'Play from Beginning'}</span>
                </button>
              )}

              <button
                disabled={!isPlaying}
                onClick={handleStop}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs border border-slate-200 transition-colors"
                title="Stop Speech"
              >
                <Square className="w-4 h-4 text-rose-600" />
              </button>

              <button
                disabled={activeIdx >= totalCount - 1 || !isPlaying}
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs border border-slate-200 transition-colors"
                title="Next Element"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Page Jump & Voice & Speed controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Jump to Page Selector */}
              <div className="flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-500 text-[11px]">Page:</span>
                <select
                  value={selectedPage}
                  onChange={(e) => handlePageSelectChange(parseInt(e.target.value, 10))}
                  className="text-xs font-mono font-bold bg-transparent border-none text-slate-800 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: document.pageCount || 1 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} of {document.pageCount}
                    </option>
                  ))}
                </select>
              </div>

              {voices.length > 0 && (
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 shadow-xs max-w-[160px] truncate"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                <span>{rate}x</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-20 accent-teal-600 cursor-pointer"
                  title="Speech Speed Rate"
                />
              </div>
            </div>
          </div>

          {/* Screen Reader Utterance Transcript Stream */}
          <div className="bg-[#0b1626] rounded-2xl p-4 border border-navy-800 text-slate-300 font-mono text-xs shadow-card">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-navy-800 text-slate-400 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>Screen Reader Utterance Transcript</span>
              </div>
              <span className="text-[10px] text-slate-500">Live Voice Output</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {transcripts.length === 0 ? (
                <div className="text-slate-500 italic text-[11px]">
                  Audio output stream will log here in real-time...
                </div>
              ) : (
                transcripts.map((item) => (
                  <div key={item.id} className="text-[11px] leading-relaxed flex items-start gap-2">
                    <span className="text-teal-400 shrink-0">[{item.timestamp}]</span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-slate-800 text-teal-300 border border-slate-700 shrink-0">
                      {item.tag}
                    </span>
                    <span className="text-slate-200">"{item.spokenText}"</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
