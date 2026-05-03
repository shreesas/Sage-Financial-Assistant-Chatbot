import { useCallback, useEffect, useRef, useState } from 'react';
import { useAzureSpeech } from '../hooks/useAzureSpeech';
import { useConversation } from '../hooks/useConversation';
import { useStockData } from '../hooks/useStockData';
import type { Message, OptionChip, WidgetSlot } from '../types';
import AlertSummary from './AlertSummary';
import Composer from './Composer';
import ThemeToggle from './ThemeToggle';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import NewsCards from './NewsCards';
import OptionMenu from './OptionMenu';
import PairsTable from './PairsTable';
import SpreadChart from './SpreadChart';
import SpreadTable from './SpreadTable';
import SpeakingIndicator from './SpeakingIndicator';
import ListeningIndicator from './ListeningIndicator';

function SoundOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5 6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5Z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5 6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5Z" fill="currentColor" />
      <path d="m17 9 4 4m0-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Slot({
  slot,
  onPick,
}: {
  slot: WidgetSlot;
  onPick?: (chip: OptionChip) => void;
}) {
  switch (slot.kind) {
    case 'pairs':
      return <PairsTable onPick={onPick} />;
    case 'spread':
      return <SpreadTable pair={slot.pair} window={slot.window} />;
    case 'chart':
      return <SpreadChart pair={slot.pair} window={slot.window} />;
    case 'news':
      return <NewsCards pair={slot.pair} />;
    case 'alert':
      return (
        <AlertSummary
          pair={slot.pair}
          threshold={slot.threshold}
          method={slot.method}
          currentZ={slot.currentZ}
        />
      );
  }
}

function MessageRow({
  message,
  isLatestSage,
  onPick,
}: {
  message: Message;
  isLatestSage: boolean;
  onPick: (chip: OptionChip) => void;
}) {
  const slots = message.slots ?? [];
  const hasSpreadChart =
    slots.some((s) => s.kind === 'spread') &&
    slots.some((s) => s.kind === 'chart');

  const slotEl = (s: (typeof slots)[number], i: number) => (
    <Slot
      key={i}
      slot={s}
      onPick={
        s.kind === 'pairs' && isLatestSage && !message.optionsResolved
          ? onPick
          : undefined
      }
    />
  );

  return (
    <MessageBubble message={message}>
      {hasSpreadChart ? (
        <div className="spread-chart-row">
          {slots.map((s, i) => slotEl(s, i))}
        </div>
      ) : (
        slots.map((s, i) => slotEl(s, i))
      )}
      {message.options && (
        <OptionMenu
          options={message.options}
          resolved={message.optionsResolved}
          onSelect={onPick}
        />
      )}
    </MessageBubble>
  );
}

export default function Chat() {
  const stock = useStockData();
  const getZ = useCallback(
    (pair: Parameters<typeof stock.getStats>[0], window: Parameters<typeof stock.getStats>[1]) => {
      const s = stock.getStats(pair, window);
      return s ? s.zScore : null;
    },
    [stock]
  );
  const { state, sendUserText, selectOption } = useConversation(getZ, stock.getStats);
  const speech = useAzureSpeech();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  // Mute toggle — ref keeps the value current inside the effect closure
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    setIsMuted(next);
    if (next) {
      speech.stopSpeaking();
    } else {
      // Mark every Sage message currently in view as spoken so unmuting
      // doesn't replay history — only messages arriving after this point play.
      state.messages.forEach((m) => {
        if (m.speaker === 'sage' && m.text) spokenIdsRef.current.add(m.id);
      });
    }
  }, [speech, state.messages]);

  const userHasReplied = state.messages.some((m) => m.speaker === 'user');

  useEffect(() => {
    if (!userHasReplied) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages, userHasReplied]);

  // Auto-speak any Sage messages that haven't been spoken yet
  useEffect(() => {
    if (isMutedRef.current) return;

    const unsaid = state.messages.filter(
      (m) => m.speaker === 'sage' && m.text && !spokenIdsRef.current.has(m.id)
    );
    if (unsaid.length === 0) return;

    unsaid.forEach((m) => spokenIdsRef.current.add(m.id));

    const combinedText = unsaid.map((m) => m.ttsText ?? m.text).join(' ');
    const lastId = unsaid[unsaid.length - 1].id;
    speech.speak(combinedText, lastId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages]);

  const handleSend = useCallback(
    (text: string) => {
      speech.stopSpeaking();
      sendUserText(text);
    },
    [speech, sendUserText]
  );

  const handleSelectOption = useCallback(
    (chip: Parameters<typeof selectOption>[0]) => {
      speech.stopSpeaking();
      selectOption(chip);
    },
    [speech, selectOption]
  );

  let latestSageId: string | null = null;
  for (let i = state.messages.length - 1; i >= 0; i -= 1) {
    if (state.messages[i].speaker === 'sage') {
      latestSageId = state.messages[i].id;
      break;
    }
  }

  return (
    <div className="chat">
      {userHasReplied && (
        <header className="chat__header">
          <span className="chat__header-title">
            <span className="chat__header-name">Sage:</span>
            <span className="chat__header-sub">Your Financial Assistant</span>
          </span>
        </header>
      )}
      <div className="chat__scroll" ref={scrollRef}>
        <div className="chat__inner">
          {!userHasReplied ? (
            <EmptyState
              onSelectCategory={(id) => {
                if (id === 'arbitrage') sendUserText('Arbitrage Watchlist');
              }}
            />
          ) : (
            <>
              {state.messages.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  isLatestSage={m.id === latestSageId}
                  onPick={handleSelectOption}
                />
              ))}
              <div ref={bottomRef} className="chat__scroll-anchor" aria-hidden />
            </>
          )}
        </div>
      </div>

      {speech.listening && (
        <ListeningIndicator onStop={speech.stopListening} isSpeaking={speech.userIsSpeaking} />
      )}

      {speech.isSpeaking && !isMuted && (
        <SpeakingIndicator onStop={speech.stopSpeaking} />
      )}

      <div className="chat__composer-wrap">
        <div className="chat__composer-inner">
          <div className="chat__composer-row">
            <Composer
              onSend={handleSend}
              disabled={state.step === 'closed'}
              voice={{
                supported: speech.supported,
                listening: speech.listening,
                start: (opts) => { speech.stopSpeaking(); speech.startListening(opts); },
                stop: speech.stopListening,
              }}
            />
            <button
              type="button"
              className={`composer__btn${isMuted ? ' composer__btn--muted' : ''}`}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute Sage voice' : 'Mute Sage voice'}
              title={isMuted ? 'Voice muted — click to unmute' : 'Click to mute voice'}
            >
              {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
