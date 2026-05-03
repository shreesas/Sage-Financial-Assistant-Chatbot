import { useCallback, useEffect, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export type AzureSpeech = {
  supported: boolean;
  listening: boolean;
  userIsSpeaking: boolean;
  startListening: (opts: {
    onInterim?: (text: string) => void;
    onFinal?: (text: string) => void;
  }) => void;
  stopListening: () => void;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  speak: (text: string, messageId: string) => void;
  stopSpeaking: () => void;
};

const key = import.meta.env.VITE_AZURE_SPEECH_API_KEY as string | undefined;
const region = import.meta.env.VITE_AZURE_SPEECH_REGION as string | undefined;

function createSpeechConfig(): SpeechSDK.SpeechConfig | null {
  if (!key || !region) return null;
  const config = SpeechSDK.SpeechConfig.fromSubscription(key, region);
  config.speechRecognitionLanguage = 'en-US';
  config.speechSynthesisLanguage = 'en-US';
  config.speechSynthesisVoiceName = 'en-US-JennyNeural';
  return config;
}

export function useAzureSpeech(): AzureSpeech {
  const supported = !!(key && region);
  const [listening, setListening] = useState(false);
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  // SpeakerAudioDestination gives us pause() to cut audio immediately
  const playerRef = useRef<SpeechSDK.SpeakerAudioDestination | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      try { playerRef.current?.pause(); } catch { /* noop */ }
      try { recognizerRef.current?.close(); } catch { /* noop */ }
      try { synthesizerRef.current?.close(); } catch { /* noop */ }
    };
  }, []);

  const clearVoiceTimer = () => {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
  };

  const stopListening = useCallback(() => {
    clearVoiceTimer();
    setUserIsSpeaking(false);
    const rec = recognizerRef.current;
    if (!rec) return;
    rec.stopContinuousRecognitionAsync(
      () => { setListening(false); rec.close(); recognizerRef.current = null; },
      () => { setListening(false); recognizerRef.current = null; }
    );
  }, []);

  const startListening = useCallback(
    (opts: { onInterim?: (t: string) => void; onFinal?: (t: string) => void }) => {
      if (!supported || listening) return;
      const config = createSpeechConfig();
      if (!config) return;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(config, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.recognizing = (_s, e) => {
        if (e.result.text) {
          opts.onInterim?.(e.result.text);
          setUserIsSpeaking(true);
          clearVoiceTimer();
          // After 350 ms of silence the recognizing events stop — freeze the bars
          voiceTimerRef.current = setTimeout(() => setUserIsSpeaking(false), 350);
        }
      };

      recognizer.recognized = (_s, e) => {
        clearVoiceTimer();
        setUserIsSpeaking(false);
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
          opts.onFinal?.(e.result.text.trim());
        }
        recognizer.stopContinuousRecognitionAsync(
          () => { setListening(false); recognizer.close(); recognizerRef.current = null; },
          () => { setListening(false); recognizerRef.current = null; }
        );
      };

      recognizer.canceled = () => {
        clearVoiceTimer();
        setUserIsSpeaking(false);
        setListening(false);
        recognizerRef.current = null;
      };

      setListening(true);
      recognizer.startContinuousRecognitionAsync(
        () => { /* started */ },
        () => { setListening(false); recognizerRef.current = null; }
      );
    },
    [supported, listening]
  );

  // Cuts audio immediately via the player, then disposes the synthesizer
  const stopSpeaking = useCallback(() => {
    try { playerRef.current?.pause(); } catch { /* noop */ }
    playerRef.current = null;
    const synth = synthesizerRef.current;
    if (synth) {
      try { synth.close(); } catch { /* noop */ }
      synthesizerRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const speak = useCallback(
    (text: string, messageId: string) => {
      if (!supported || !text) return;

      // Immediately cut any playing audio before starting new synthesis
      try { playerRef.current?.pause(); } catch { /* noop */ }
      playerRef.current = null;
      const prev = synthesizerRef.current;
      if (prev) {
        try { prev.close(); } catch { /* noop */ }
        synthesizerRef.current = null;
      }

      const config = createSpeechConfig();
      if (!config) return;

      // Route audio through SpeakerAudioDestination so pause() works reliably
      const player = new SpeechSDK.SpeakerAudioDestination();
      playerRef.current = player;

      // onAudioEnd fires when the audio has actually finished playing —
      // speakTextAsync's success callback fires when data is sent, not when
      // playback ends, so we rely on this event to clear the speaking state.
      player.onAudioEnd = () => {
        if (playerRef.current === player) {
          playerRef.current = null;
          synthesizerRef.current = null;
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        }
      };

      const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
      const synthesizer = new SpeechSDK.SpeechSynthesizer(config, audioConfig);
      synthesizerRef.current = synthesizer;
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);

      synthesizer.speakTextAsync(
        text,
        (result) => {
          synthesizer.close();
          // Only clear state immediately if synthesis was cancelled (no audio played)
          if (result.reason === SpeechSDK.ResultReason.Canceled) {
            if (synthesizerRef.current === synthesizer) {
              synthesizerRef.current = null;
              playerRef.current = null;
              setIsSpeaking(false);
              setSpeakingMessageId(null);
            }
          }
          // Otherwise let onAudioEnd handle the state clear after playback finishes
        },
        () => {
          // On error, clear immediately since no audio will play
          synthesizer.close();
          if (synthesizerRef.current === synthesizer) {
            synthesizerRef.current = null;
            playerRef.current = null;
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          }
        }
      );
    },
    [supported]
  );

  return {
    supported,
    listening,
    userIsSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    speakingMessageId,
    speak,
    stopSpeaking,
  };
}
