import { useCallback, useState } from 'react';

type VoiceProp = {
  supported: boolean;
  listening: boolean;
  start: (opts: { onInterim?: (t: string) => void; onFinal?: (t: string) => void }) => void;
  stop: () => void;
};

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  voice: VoiceProp;
};

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12 20 4l-4 16-4-7-8-1Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Composer({
  onSend,
  disabled,
  placeholder = 'Message your finance assistant…',
  voice,
}: Props) {
  const [value, setValue] = useState('');

  const submit = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      onSend(t);
      setValue('');
    },
    [onSend]
  );

  const handleMicClick = () => {
    if (voice.listening) {
      voice.stop();
    } else {
      voice.start({
        onInterim: (text) => setValue(text),
        onFinal: (text) => {
          setValue('');
          submit(text);
        },
      });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(value);
    }
  };

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
    >
      <button
        type="button"
        className={`composer__btn ${
          voice.listening ? 'composer__btn--mic-active' : ''
        }`}
        onClick={handleMicClick}
        disabled={!voice.supported || disabled}
        aria-label={voice.listening ? 'Stop voice input' : 'Start voice input'}
        title={
          voice.supported
            ? voice.listening
              ? 'Listening… tap to stop'
              : 'Tap to speak'
            : 'Voice input not supported — check Azure Speech config'
        }
      >
        <MicIcon />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Message Sage"
      />
      <button
        type="submit"
        className="composer__btn composer__btn--send"
        disabled={disabled || !value.trim()}
        aria-label="Send"
      >
        <SendIcon />
      </button>
    </form>
  );
}
