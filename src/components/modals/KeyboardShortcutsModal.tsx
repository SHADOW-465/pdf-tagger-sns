import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const tagShortcuts = [
    { key: '1', desc: 'Tag as H1 (Book / Chapter Title)' },
    { key: '2', desc: 'Tag as H2 (Section Heading)' },
    { key: '3', desc: 'Tag as H3 (Subsection Heading)' },
    { key: 'P', desc: 'Tag as P (Body Paragraph)' },
    { key: 'F', desc: 'Tag as Figure (Graphic Image / Diagram)' },
    { key: 'T', desc: 'Tag as Table (Tabular Data Matrix)' },
    { key: 'L', desc: 'Tag as ListItem (Bullet / Numbered Item)' },
    { key: 'A', desc: 'Tag as Artifact (Decorative / Header / Footer)' },
  ];

  const navigationShortcuts = [
    { key: 'Tab', desc: 'Move focus forward to next interactive element' },
    { key: 'Shift + Tab', desc: 'Move focus backward to previous element' },
    { key: 'Ctrl / Cmd + Up', desc: 'Shift selected element up in reading order' },
    { key: 'Ctrl / Cmd + Down', desc: 'Shift selected element down in reading order' },
    { key: 'Space / Enter', desc: 'Select or toggle focused element / button' },
    { key: 'Esc', desc: 'Close open modal or dialog' },
    { key: '?', desc: 'Open this Keyboard Shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1626] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-teal-400" />
            <h3 className="font-serif font-bold text-base text-white">
              Keyboard Shortcuts & Accessibility
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-6 text-xs text-left overflow-y-auto">
          {/* Tagging Hotkeys */}
          <div>
            <h4 className="font-serif font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <Command className="w-4 h-4 text-teal-600" />
              <span>Direct Tagging Hotkeys (When Element Selected)</span>
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-subtle">
              {tagShortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/60">
                  <span className="text-slate-700 font-medium">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs text-slate-900 shadow-xs font-bold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <h4 className="font-serif font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Navigation & Reordering Controls</span>
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-subtle">
              {navigationShortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/60">
                  <span className="text-slate-700 font-medium">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-800 shadow-xs font-semibold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
