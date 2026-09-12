import type { PdfElement } from '../types/pdf';
import { formatSpeechAnnouncement } from '../utils/helpers';

export interface ScreenReaderVoiceConfig {
  voice?: SpeechSynthesisVoice | null;
  rate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 1.5
  volume: number; // 0.0 to 1.0
}

export interface SpeechTranscriptItem {
  id: string;
  elementId: string;
  readingOrder: number;
  tag: string;
  spokenText: string;
  timestamp: string;
}

export type ActiveElementCallback = (element: PdfElement | null, index: number, total: number) => void;
export type TranscriptCallback = (item: SpeechTranscriptItem) => void;
export type StateChangeCallback = (isPlaying: boolean, isPaused: boolean) => void;

export class ScreenReaderSimulator {
  private synth: SpeechSynthesis | null = null;
  private elements: PdfElement[] = [];
  private currentIndex: number = -1;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceConfig: ScreenReaderVoiceConfig = {
    voice: null,
    rate: 1.05,
    pitch: 1.0,
    volume: 1.0,
  };

  private activeListeners = new Set<ActiveElementCallback>();
  private transcriptListeners = new Set<TranscriptCallback>();
  private stateListeners = new Set<StateChangeCallback>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callbacks: {
    onActiveElementChange?: ActiveElementCallback;
    onTranscriptUpdate?: TranscriptCallback;
    onStateChange?: StateChangeCallback;
  }): () => void {
    const { onActiveElementChange, onTranscriptUpdate, onStateChange } = callbacks;
    if (onActiveElementChange) this.activeListeners.add(onActiveElementChange);
    if (onTranscriptUpdate) this.transcriptListeners.add(onTranscriptUpdate);
    if (onStateChange) this.stateListeners.add(onStateChange);

    return () => {
      if (onActiveElementChange) this.activeListeners.delete(onActiveElementChange);
      if (onTranscriptUpdate) this.transcriptListeners.delete(onTranscriptUpdate);
      if (onStateChange) this.stateListeners.delete(onStateChange);
    };
  }

  public setCallbacks(
    onActiveElementChange?: ActiveElementCallback,
    onTranscriptUpdate?: TranscriptCallback,
    onStateChange?: StateChangeCallback
  ) {
    if (onActiveElementChange) this.activeListeners.add(onActiveElementChange);
    if (onTranscriptUpdate) this.transcriptListeners.add(onTranscriptUpdate);
    if (onStateChange) this.stateListeners.add(onStateChange);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoiceConfig(config: Partial<ScreenReaderVoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
  }

  public getVoiceConfig(): ScreenReaderVoiceConfig {
    return { ...this.voiceConfig };
  }

  public setElements(elements: PdfElement[]) {
    // Filter out artifacts from screen reader audio stream (WCAG 1.3.1 requirement)
    this.elements = elements
      .filter((el) => el.tag !== 'Artifact')
      .sort((a, b) => a.readingOrder - b.readingOrder);
  }

  public getElements(): PdfElement[] {
    return this.elements;
  }

  public getCurrentElement(): PdfElement | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.elements.length) {
      return this.elements[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getPlaybackState(): { isPlaying: boolean; isPaused: boolean } {
    return { isPlaying: this.isPlaying, isPaused: this.isPaused };
  }

  public playFromStart() {
    if (this.elements.length === 0) return;
    this.currentIndex = 0;
    this.speakCurrent();
  }

  public playFromPage(pageNumber: number) {
    if (this.elements.length === 0) return;
    const pageIndex = this.elements.findIndex((el) => el.pageNumber === pageNumber);
    if (pageIndex !== -1) {
      this.currentIndex = pageIndex;
      this.speakCurrent();
    } else {
      // Find nearest element on subsequent pages or start
      const nextPageIndex = this.elements.findIndex((el) => el.pageNumber >= pageNumber);
      this.currentIndex = nextPageIndex !== -1 ? nextPageIndex : 0;
      this.speakCurrent();
    }
  }

  public playFromElement(elementId: string) {
    const idx = this.elements.findIndex((el) => el.id === elementId);
    if (idx !== -1) {
      this.currentIndex = idx;
      this.speakCurrent();
    }
  }

  public pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = -1;
    this.notifyActive(null, -1, this.elements.length);
    this.notifyState();
  }

  public next() {
    if (this.currentIndex < this.elements.length - 1) {
      this.currentIndex++;
      this.speakCurrent();
    } else {
      this.stop();
    }
  }

  public previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.speakCurrent();
    }
  }

  private notifyActive(element: PdfElement | null, index: number, total: number) {
    this.activeListeners.forEach((fn) => {
      try {
        fn(element, index, total);
      } catch (err) {
        console.error('Error in speech active listener:', err);
      }
    });
  }

  private notifyTranscript(item: SpeechTranscriptItem) {
    this.transcriptListeners.forEach((fn) => {
      try {
        fn(item);
      } catch (err) {
        console.error('Error in speech transcript listener:', err);
      }
    });
  }

  private notifyState() {
    this.stateListeners.forEach((fn) => {
      try {
        fn(this.isPlaying, this.isPaused);
      } catch (err) {
        console.error('Error in speech state listener:', err);
      }
    });
  }

  private speakCurrent() {
    if (!this.synth || this.currentIndex < 0 || this.currentIndex >= this.elements.length) {
      this.stop();
      return;
    }

    try {
      this.synth.cancel();
    } catch {
      /* ignore cancel error */
    }

    const currentEl = this.elements[this.currentIndex];
    const spokenText = formatSpeechAnnouncement(currentEl);

    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();
    this.notifyActive(currentEl, this.currentIndex, this.elements.length);

    this.notifyTranscript({
      id: `tr-${Date.now()}-${this.currentIndex}`,
      elementId: currentEl.id,
      readingOrder: currentEl.readingOrder,
      tag: currentEl.tag,
      spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    const utterance = new SpeechSynthesisUtterance(spokenText);
    this.currentUtterance = utterance; // Prevent garbage-collection mid-utterance in Chrome

    if (this.voiceConfig.voice) utterance.voice = this.voiceConfig.voice;
    utterance.rate = this.voiceConfig.rate;
    utterance.pitch = this.voiceConfig.pitch;
    utterance.volume = this.voiceConfig.volume;

    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
      if (this.isPlaying && !this.isPaused) {
        if (this.currentIndex < this.elements.length - 1) {
          this.currentIndex++;
          this.speakCurrent();
        } else {
          this.stop();
        }
      }
    };

    utterance.onerror = (e) => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
      // 'interrupted' or 'canceled' are normal when jumping or stopping
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('Speech synthesis error:', e);
      if (this.isPlaying && !this.isPaused && this.currentIndex < this.elements.length - 1) {
        this.currentIndex++;
        this.speakCurrent();
      } else if (!this.isPaused) {
        this.stop();
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Failed to speak utterance:', err);
      this.stop();
    }
  }
}

export const screenReaderService = new ScreenReaderSimulator();
