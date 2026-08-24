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

export class ScreenReaderSimulator {
  private synth: SpeechSynthesis | null = null;
  private elements: PdfElement[] = [];
  private currentIndex: number = -1;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private voiceConfig: ScreenReaderVoiceConfig = {
    voice: null,
    rate: 1.05,
    pitch: 1.0,
    volume: 1.0,
  };

  private onActiveElementChange?: (element: PdfElement | null, index: number, total: number) => void;
  private onTranscriptUpdate?: (item: SpeechTranscriptItem) => void;
  private onStateChange?: (isPlaying: boolean, isPaused: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setCallbacks(
    onActiveElementChange?: (element: PdfElement | null, index: number, total: number) => void,
    onTranscriptUpdate?: (item: SpeechTranscriptItem) => void,
    onStateChange?: (isPlaying: boolean, isPaused: boolean) => void
  ) {
    this.onActiveElementChange = onActiveElementChange;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onStateChange = onStateChange;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoiceConfig(config: Partial<ScreenReaderVoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
  }

  public setElements(elements: PdfElement[]) {
    // Filter out artifacts from screen reader audio stream (WCAG 1.3.1 requirement)
    this.elements = elements
      .filter((el) => el.tag !== 'Artifact')
      .sort((a, b) => a.readingOrder - b.readingOrder);
  }

  public playFromStart() {
    if (this.elements.length === 0) return;
    this.currentIndex = 0;
    this.speakCurrent();
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
      this.onStateChange?.(this.isPlaying, this.isPaused);
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.onStateChange?.(this.isPlaying, this.isPaused);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = -1;
    this.onActiveElementChange?.(null, -1, this.elements.length);
    this.onStateChange?.(false, false);
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

  private speakCurrent() {
    if (!this.synth || this.currentIndex < 0 || this.currentIndex >= this.elements.length) {
      this.stop();
      return;
    }

    this.synth.cancel();

    const currentEl = this.elements[this.currentIndex];
    const spokenText = formatSpeechAnnouncement(currentEl);

    this.isPlaying = true;
    this.isPaused = false;
    this.onStateChange?.(this.isPlaying, this.isPaused);
    this.onActiveElementChange?.(currentEl, this.currentIndex, this.elements.length);

    this.onTranscriptUpdate?.({
      id: `tr-${Date.now()}-${this.currentIndex}`,
      elementId: currentEl.id,
      readingOrder: currentEl.readingOrder,
      tag: currentEl.tag,
      spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    const utterance = new SpeechSynthesisUtterance(spokenText);
    if (this.voiceConfig.voice) utterance.voice = this.voiceConfig.voice;
    utterance.rate = this.voiceConfig.rate;
    utterance.pitch = this.voiceConfig.pitch;
    utterance.volume = this.voiceConfig.volume;

    utterance.onend = () => {
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
      console.warn('Speech synthesis error or cancelled:', e);
      if (this.isPlaying && this.currentIndex < this.elements.length - 1) {
        this.currentIndex++;
        this.speakCurrent();
      } else {
        this.stop();
      }
    };

    this.synth.speak(utterance);
  }
}

export const screenReaderService = new ScreenReaderSimulator();
