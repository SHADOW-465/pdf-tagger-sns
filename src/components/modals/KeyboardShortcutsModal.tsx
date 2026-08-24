import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Tab', desc: 'Move focus forward across interactive elements' },
    { key: 'Shift + Tab', desc: 'Move focus backward' },
    { key: 'Space / Enter', desc: 'Activate selected button or toggle tag' },
    { key: 'Arrow Up / Down', desc: 'Navigate between elements in structure tree' },
    { key: 'Ctrl / Cmd + Up', desc: 'Move selected element up in reading order' },
    { key: 'Ctrl / Cmd + Down', desc: 'Move selected element down in reading order' },
    { key: 'P', desc: 'Play / Pause Read Aloud screen reader speech' },
    { key: 'Esc', desc: 'Close open modal or dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1626] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-teal-400" />
            <h3 className="font-serif font-bold text-sm text-white">
              Accessibility & Keyboard Navigation
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-4 text-xs text-left">
          <p className="text-slate-600">
            Accessible Ebook Tagger is engineered for high contrast, visible focus states, and 100% keyboard accessibility.
          </p>

          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-subtle">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50">
                <span className="text-slate-700 font-medium">{s.desc}</span>
                <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-800 shadow-xs font-semibold">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
