import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
  resultIndex: number;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceInput = {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
};

export function useVoiceInput(opts: {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
}): VoiceInput {
  const { onInterim, onFinal } = opts;
  const [ctor] = useState<SpeechRecognitionCtor | null>(() =>
    typeof window !== 'undefined' ? getCtor() : null
  );
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = !!ctor;
  const [listening, setListening] = useState(false);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!ctor || listening) return;
    const rec = new ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? '';
        if (r.isFinal) final += t;
        else interim += t;
      }
      if (interim && onInterim) onInterim(interim);
      if (final) {
        onFinal?.(final.trim());
      }
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [ctor, listening, onInterim, onFinal]);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* noop */
    }
  }, []);

  return { supported, listening, start, stop };
}
