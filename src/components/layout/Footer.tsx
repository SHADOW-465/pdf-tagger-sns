import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1626] border-t border-navy-800 text-slate-400 text-xs py-5 px-6 font-sans">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Privacy & Guarantee badges */}
        <div className="flex flex-wrap items-center gap-4 text-[11.5px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>100% Client-Side Privacy</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Zero Training on User Content</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Human-in-the-Loop Verification</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>PDF/UA-1 & WCAG 2.1 AA Compliant</span>
          </div>
        </div>

        {/* Disclaimer & Standard Info */}
        <div className="text-slate-500 text-[11px] text-center md:text-right">
          <p>
            Accessible Ebook Tagger Engine v2.4 • ISO 14289-1 (PDF/UA) & W3C WCAG 2.1
          </p>
        </div>
      </div>
    </footer>
  );
};
