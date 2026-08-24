import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Wrench
} from 'lucide-react';
import type { EbookDocument, ValidationIssue } from '../../types/pdf';
import { evaluateAccessibility } from '../../services/accessibilityValidator';
import { generateAiAltText } from '../../services/altTextGenerator';

interface ValidationScreenProps {
  document: EbookDocument;
  onUpdateDocument: (doc: EbookDocument) => void;
  onNavigateToExport: () => void;
  onNavigateToWorkspace: () => void;
}

export const ValidationScreen: React.FC<ValidationScreenProps> = ({
  document,
  onUpdateDocument,
  onNavigateToExport,
  onNavigateToWorkspace,
}) => {
  const report = document.validationReport;
  const score = report.overallScore;

  // Celebrate with confetti if score reaches 100%
  useEffect(() => {
    if (score >= 100) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0f766e', '#14b8a6', '#0284c7', '#38bdf8'],
      });
    }
  }, [score]);

  const handleAutoFix = (issue: ValidationIssue) => {
    let updatedElements = [...document.elements];
    let updatedMetadata = { ...document.metadata };

    if (issue.category === 'metadata') {
      if (issue.id === 'iss-meta-title') {
        const firstH1 = updatedElements.find((e) => e.tag === 'H1');
        updatedMetadata.title = firstH1 ? firstH1.text : 'The Architecture of Thought';
      } else if (issue.id === 'iss-meta-lang') {
        updatedMetadata.language = 'en-US';
      }
    } else if (issue.category === 'altText' && issue.elementId) {
      const el = updatedElements.find((e) => e.id === issue.elementId);
      if (el) {
        el.altText = el.aiAltTextSuggested || generateAiAltText(el, updatedElements);
        el.isFlaggedForReview = false;
      }
    } else if (issue.category === 'table' && issue.elementId) {
      const el = updatedElements.find((e) => e.id === issue.elementId);
      if (el && el.tableData) {
        el.tableData.hasHeaderRow = true;
        el.tableData.cells.forEach((c) => {
          if (c.rowIndex === 0) c.isHeader = true;
        });
      }
    } else if (issue.category === 'artifact' && issue.elementId) {
      const el = updatedElements.find((e) => e.id === issue.elementId);
      if (el) {
        el.tag = 'Artifact';
        el.isDecorative = true;
        el.confidence = 1.0;
      }
    } else if (issue.category === 'heading' && issue.elementId) {
      const el = updatedElements.find((e) => e.id === issue.elementId);
      if (el) {
        if (issue.id === 'iss-head-first') {
          el.tag = 'H1';
        } else {
          el.tag = 'H2';
        }
      }
    }

    const newReport = evaluateAccessibility(updatedElements, updatedMetadata);

    onUpdateDocument({
      ...document,
      metadata: updatedMetadata,
      elements: updatedElements,
      validationReport: newReport,
      updatedAt: new Date(),
    });
  };

  const handleFixAllIssues = () => {
    report.issues.forEach((issue) => {
      if (issue.fixable) {
        handleAutoFix(issue);
      }
    });
  };

  const isPerfect = score >= 98;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>ISO 14289-1 & WCAG 2.1 Conformance Audit</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-900">
            Accessibility Compliance Scorecard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToWorkspace}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>

          <button
            onClick={onNavigateToExport}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Export</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Score Banner Hero */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Score dial */}
          <div className="md:col-span-5 text-center md:text-left flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={score >= 90 ? '#0f766e' : '#d97706'}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 264} 264`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-3xl font-bold text-navy-900">{score}%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-bold text-2xl text-slate-900">
                  {report.wcagLevel} Rating
                </span>
                {report.pdfUaCompliant && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                    PDF/UA Validated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isPerfect
                  ? 'Zero blocking accessibility violations detected. Screen readers can effortlessly parse all headings, reading flows, and media.'
                  : 'Minor repair items detected. Review the items below or use 1-click Quick Fixes to achieve 100% compliance.'}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="md:col-span-7 grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 text-left">
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="text-[11px] text-emerald-800 font-medium mb-1">Passed Checks</div>
              <div className="font-mono font-bold text-2xl text-emerald-900">
                {report.passedChecks}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">WCAG 2.1 Rules</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
              <div className="text-[11px] text-amber-800 font-medium mb-1">Warnings</div>
              <div className="font-mono font-bold text-2xl text-amber-900">
                {report.warningChecks}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">Non-blocking</div>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
              <div className="text-[11px] text-rose-800 font-medium mb-1">Errors</div>
              <div className="font-mono font-bold text-2xl text-rose-900">
                {report.errorChecks}
              </div>
              <div className="text-[10px] text-rose-700 mt-1">PDF/UA Violations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Quick Fixes Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-8 mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Audit Findings & Auto-Repairs ({report.issues.length})
            </h3>
          </div>

          {report.issues.length > 0 && (
            <button
              onClick={handleFixAllIssues}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Apply All Quick Fixes</span>
            </button>
          )}
        </div>

        {report.issues.length === 0 ? (
          <div className="text-center py-10 bg-emerald-50/40 rounded-2xl border border-emerald-100 p-8">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-base mb-1">
              All Accessibility Criteria Passed!
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your document complies with PDF/UA-1 (ISO 14289-1) and WCAG 2.1 AA specifications. You can export the tagged PDF now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        issue.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : issue.severity === 'serious'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs font-serif font-bold text-slate-900">
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{issue.description}</p>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span>{issue.wcagCriterion}</span>
                    <span>•</span>
                    <span>{issue.pdfUaClause}</span>
                    {issue.pageNumber && (
                      <>
                        <span>•</span>
                        <span>Page {issue.pageNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                {issue.fixable && (
                  <button
                    onClick={() => handleAutoFix(issue)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium border border-teal-200 transition-colors shrink-0 flex items-center gap-1.5 shadow-subtle"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>{issue.autoFixAction || 'Auto-Fix'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
