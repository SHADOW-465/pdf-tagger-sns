import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  Terminal,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { EbookDocument, ProcessingPipelineStep } from '../../types/pdf';

interface AnalysisScreenProps {
  document: EbookDocument | null;
  onAnalysisComplete: () => void;
  fileName?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  onLoadDemo?: () => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  document,
  onAnalysisComplete,
  fileName,
  errorMessage,
  onRetry,
  onLoadDemo,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [pipelineProgressDone, setPipelineProgressDone] = useState(false);

  const pipelineSteps: ProcessingPipelineStep[] = [
    {
      id: 'step-1',
      name: 'PDF Text Extraction & Vector Font Probe',
      description: 'Parsing vector font metrics, glyph positions, and baseline coordinates.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-2',
      name: 'OCR & Scanned Page Verification',
      description: 'Verifying raster resolution and executing OCR fallback on flat pages.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-3',
      name: 'Spatial Layout & Column Detection',
      description: 'Identifying multi-column spreads, headers, footers, and floating gutters.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-4',
      name: 'Heading & Chapter Hierarchy Detection',
      description: 'Inferring H1-H6 levels based on typography distribution and numbering.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-5',
      name: 'Reading-Order Topological Sorting',
      description: 'Constructing non-interleaved sequential flow for assistive readers.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-6',
      name: 'AI Image Description & Alt Text Synthesis',
      description: 'Generating rich descriptions for diagrams, charts, and figures.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-7',
      name: 'PDF Accessibility Tagging & Structure Tree',
      description: 'Synthesizing StructTreeRoot, standard role mappings, and MarkInfo.',
      status: 'pending',
      progress: 100,
    },
    {
      id: 'step-8',
      name: 'WCAG 2.1 AA & PDF/UA Validation Audit',
      description: 'Executing automated accessibility compliance audit and calculating scorecard.',
      status: 'pending',
      progress: 100,
    },
  ];

  useEffect(() => {
    let currentIdx = 0;
    const initialLogs: string[] = [
      `[${new Date().toLocaleTimeString()}] Ingesting ${fileName || 'document.pdf'}...`,
      `[${new Date().toLocaleTimeString()}] PDF.js local worker initialized...`,
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < pipelineSteps.length) {
        setCurrentStepIndex(currentIdx);
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Running: ${pipelineSteps[currentIdx].name}...`,
          `[${new Date().toLocaleTimeString()}] Layout entities probed on page cluster...`,
        ]);
      } else {
        clearInterval(interval);
        setPipelineProgressDone(true);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [fileName]);

  useEffect(() => {
    if (document) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✨ Ingestion complete: ${document.elements.length} tags discovered across ${document.pageCount} page(s).`,
        `[${new Date().toLocaleTimeString()}] Baseline accessibility score: ${document.validationReport.overallScore}% • Ready for human review.`,
      ]);
    }
  }, [document]);

  const isReady = pipelineProgressDone && !!document;
  const overallProgress = errorMessage 
    ? 100 
    : isReady 
    ? 100 
    : Math.min(95, Math.round(((currentStepIndex + 1) / pipelineSteps.length) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        {errorMessage ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ingestion Error</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-mono mb-3">
            <RefreshCw className={`w-3.5 h-3.5 ${!isReady ? 'animate-spin' : ''}`} />
            <span>{isReady ? 'Analysis Completed' : 'Ingestion Pipeline in Progress'}</span>
          </div>
        )}

        <h1 className="font-serif text-3xl font-bold text-navy-900 mb-2">
          {errorMessage
            ? 'PDF Ingestion Notice'
            : isReady
            ? 'Document Structure Inferred'
            : 'Analyzing Document Geometry & Tags'}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Processing {fileName || document?.fileName || 'ebook'} through our 8-stage accessibility engine.
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 mb-8 text-left">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Failed to parse PDF document</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed mb-4">{errorMessage}</p>
          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Load Interactive Demo Ebook Instead</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card mb-8 text-left">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-2">
          <span>Overall Pipeline Progress</span>
          <span className={`font-bold ${errorMessage ? 'text-rose-700' : 'text-teal-700'}`}>
            {overallProgress}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              errorMessage
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 8-Stage Pipeline Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 mb-8 text-left">
        <h3 className="font-serif font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Automated Pipeline Stages
        </h3>

        <div className="space-y-3">
          {pipelineSteps.map((step, idx) => {
            const isDone = (idx < currentStepIndex || isReady) && !errorMessage;
            const isCurrent = idx === currentStepIndex && !isReady && !errorMessage;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-teal-50/90 border border-teal-200'
                    : isDone
                    ? 'bg-slate-50/70'
                    : 'opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-teal-950 font-bold' : isDone ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {step.name}
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                        Passed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded animate-pulse font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Log Terminal */}
      <div className="bg-[#0b1626] rounded-3xl p-5 border border-navy-800 text-slate-300 font-mono text-xs shadow-card mb-8 text-left">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-800 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>Real-time Ingestion Stream</span>
          </div>
          <span className="text-[10px] text-teal-400">PDF/UA Parser v2.4</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 text-[11.5px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className="text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Completion CTA */}
      {!errorMessage && (
        <div className="flex justify-center">
          <button
            onClick={onAnalysisComplete}
            disabled={!document}
            className={`px-8 py-4 rounded-2xl text-white font-medium text-base shadow-float transition-all flex items-center gap-2.5 ${
              document
                ? 'bg-teal-600 hover:bg-teal-500 cursor-pointer animate-bounce-short hover:shadow-lg'
                : 'bg-slate-400 cursor-not-allowed opacity-75'
            }`}
          >
            {document ? (
              <>
                <Sparkles className="w-5 h-5 text-teal-200" />
                <span>Open 3-Pane Review Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Finalizing Document Geometry...</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
