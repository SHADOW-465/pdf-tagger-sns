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
  Activity
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
}

export const ScreenReaderModal: React.FC<ScreenReaderModalProps> = ({
  isOpen,
  onClose,
  document,
  onSelectElement,
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

  useEffect(() => {
    if (!isOpen) return;

    screenReaderService.setElements(document.elements);
    
    // Load speech voices
    const availableVoices = screenReaderService.getAvailableVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0 && !selectedVoiceUri) {
      setSelectedVoiceUri(availableVoices[0].voiceURI);
    }

    screenReaderService.setCallbacks(
      (el, idx, total) => {
        setActiveElement(el);
        setActiveIdx(idx);
        setTotalCount(total);
        if (el) {
          onSelectElement(el.id);
        }
      },
      (item) => {
        setTranscripts((prev) => [...prev.slice(-40), item]);
      },
      (playing, paused) => {
        setIsPlaying(playing);
        setIsPaused(paused);
      }
    );
  }, [isOpen, document.elements, onSelectElement, selectedVoiceUri]);

  if (!isOpen) return null;

  const handlePlay = () => {
    if (isPaused) {
      screenReaderService.resume();
    } else {
      screenReaderService.playFromStart();
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

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceUri(uri);
    const chosen = voices.find((v) => v.voiceURI === uri) || null;
    screenReaderService.setVoiceConfig({ voice: chosen });
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    screenReaderService.setVoiceConfig({ rate: newRate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
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
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                    <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                    LIVE SPEECH
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                NVDA / JAWS / Apple VoiceOver semantic announcement emulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Speaking Element Box */}
          <div className="bg-gradient-to-r from-teal-50 to-slate-50 p-5 rounded-2xl border border-teal-200 shadow-subtle">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>Current Audio Focus</span>
              <span>
                {activeElement ? `Element ${activeIdx + 1} of ${totalCount}` : 'Standby'}
              </span>
            </div>

            {activeElement ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold text-white shadow-sm"
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
                  {activeElement.text || (activeElement.altText ? `[Graphic: ${activeElement.altText}]` : '[Graphic]')}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-2">
                Press "Play from Beginning" to start synthesizing speech through the document structure tree.
              </div>
            )}
          </div>

          {/* Player Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200">
            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                disabled={activeIdx <= 0 || !isPlaying}
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm border border-slate-200 transition-colors"
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
                  <span>{isPaused ? 'Resume' : 'Play from Beginning'}</span>
                </button>
              )}

              <button
                disabled={!isPlaying}
                onClick={handleStop}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm border border-slate-200 transition-colors"
                title="Stop Speech"
              >
                <Square className="w-4 h-4 text-rose-600" />
              </button>

              <button
                disabled={activeIdx >= totalCount - 1 || !isPlaying}
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm border border-slate-200 transition-colors"
                title="Next Element"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Voice & Speed settings */}
            <div className="flex items-center gap-3">
              {voices.length > 0 && (
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 shadow-sm max-w-[180px] truncate"
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

          {/* Screen Reader Speech Transcript Log */}
          <div className="bg-[#0b1626] rounded-2xl p-4 border border-navy-800 text-slate-300 font-mono text-xs shadow-card">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-navy-800 text-slate-400 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>Screen Reader Utterance Transcript</span>
              </div>
              <span className="text-[10px] text-slate-500">Live Stream</span>
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
                    <span className="px-1 py-0.2 rounded text-[9.5px] bg-slate-800 text-slate-300 shrink-0">
                      {item.tag}
                    </span>
                    <span className="text-slate-200">"{item.spokenText}"</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Close */}
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
