import { useState, useEffect, useCallback } from 'react';
import type { EbookDocument } from './types/pdf';
import type { AppStep } from './components/layout/Navbar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingScreen } from './components/screens/LandingScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { ReviewWorkspace } from './components/screens/ReviewWorkspace';
import { ValidationScreen } from './components/screens/ValidationScreen';
import { ExportScreen } from './components/screens/ExportScreen';
import { ScreenReaderModal } from './components/modals/ScreenReaderModal';
import { AccessibilityAuditModal } from './components/modals/AccessibilityAuditModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { createDemoPdfDocument } from './services/sampleEbookGenerator';
import { parsePdfFile } from './services/pdfParser';
import { screenReaderService } from './services/speechSynthesizer';
import { UploadCloud, Sparkles } from 'lucide-react';

export function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [document, setDocument] = useState<EbookDocument | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  
  // Modals state
  const [isScreenReaderOpen, setIsScreenReaderOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Audio synchronization state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeSpokenElementId, setActiveSpokenElementId] = useState<string | null>(null);

  // Setup global speech synthesizer listener
  useEffect(() => {
    screenReaderService.setCallbacks(
      (el) => {
        setActiveSpokenElementId(el ? el.id : null);
      },
      undefined,
      (playing) => {
        setIsAudioPlaying(playing);
      }
    );
  }, []);

  // Global keyboard shortcuts (? for help, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsShortcutsModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsScreenReaderOpen(false);
        setIsAuditModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Demo Ebook Preset
  const handleLoadDemo = async () => {
    setPendingFileName('the_architecture_of_thought.pdf');
    setParsingError(null);
    setDocument(null);
    setCurrentStep('analysis');
    try {
      const demoDoc = await createDemoPdfDocument();
      setDocument(demoDoc);
    } catch (err: any) {
      console.error('Failed to create demo ebook:', err);
      setParsingError(err?.message || 'Failed to initialize sample ebook.');
    }
  };

  // Upload Custom File
  const handleFileSelected = async (file: File) => {
    setPendingFileName(file.name);
    setPendingFile(file);
    setParsingError(null);
    setDocument(null);
    setCurrentStep('analysis');
    try {
      const parsedDoc = await parsePdfFile(file, file.name);
      setDocument(parsedDoc);
    } catch (err: any) {
      console.error('Failed to parse uploaded PDF:', err);
      setParsingError(err?.message || 'Failed to parse the PDF document.');
    }
  };

  const handleRetry = () => {
    if (pendingFile) {
      handleFileSelected(pendingFile);
    } else {
      handleLoadDemo();
    }
  };

  const handleReset = useCallback(() => {
    screenReaderService.stop();
    setDocument(null);
    setPendingFileName('');
    setPendingFile(null);
    setParsingError(null);
    setCurrentStep('upload');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-slate-900 font-sans antialiased">
      {/* Top Accessible Navbar */}
      <Navbar
        currentStep={currentStep}
        onNavigate={setCurrentStep}
        document={document}
        onOpenScreenReader={() => setIsScreenReaderOpen(true)}
        isAudioPlaying={isAudioPlaying}
        onReset={handleReset}
        onLoadDemo={handleLoadDemo}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentStep === 'landing' && (
          <LandingScreen
            onUploadClick={() => setCurrentStep('upload')}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentStep === 'upload' && (
          <UploadScreen
            onFileSelected={handleFileSelected}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentStep === 'analysis' && (
          <AnalysisScreen
            document={document}
            fileName={pendingFileName}
            errorMessage={parsingError}
            onRetry={handleRetry}
            onLoadDemo={handleLoadDemo}
            onAnalysisComplete={() => setCurrentStep('workspace')}
          />
        )}

        {currentStep === 'workspace' && (
          document ? (
            <ReviewWorkspace
              document={document}
              onUpdateDocument={setDocument}
              onNavigateToValidation={() => setCurrentStep('validation')}
              activeSpokenElementId={activeSpokenElementId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[65vh] p-8 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                No Document Loaded Yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Please upload your PDF ebook or load our interactive sample publication to review layout structure and accessibility tags.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-sm transition-all"
                >
                  Upload a PDF File
                </button>
                <button
                  onClick={handleLoadDemo}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Load Demo Ebook</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentStep === 'validation' && document && (
          <ValidationScreen
            document={document}
            onUpdateDocument={setDocument}
            onNavigateToExport={() => setCurrentStep('export')}
            onNavigateToWorkspace={() => setCurrentStep('workspace')}
          />
        )}

        {currentStep === 'export' && document && (
          <ExportScreen
            document={document}
            onReset={handleReset}
            onOpenScreenReader={() => setIsScreenReaderOpen(true)}
            onOpenAuditPreview={() => setIsAuditModalOpen(true)}
          />
        )}
      </main>

      {/* Persistent Trust Footer (hidden in workspace view to maximize screen estate) */}
      {currentStep !== 'workspace' && <Footer />}

      {/* Screen Reader Audio Simulator Modal */}
      {document && (
        <ScreenReaderModal
          isOpen={isScreenReaderOpen}
          onClose={() => setIsScreenReaderOpen(false)}
          document={document}
          onSelectElement={(id) => setActiveSpokenElementId(id)}
        />
      )}

      {/* Accessibility Audit Certificate Modal */}
      {document && (
        <AccessibilityAuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          document={document}
        />
      )}

      {/* Keyboard Navigation Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
