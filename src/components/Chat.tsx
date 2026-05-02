import { useCallback, useEffect, useRef } from 'react';
import { useConversation } from '../hooks/useConversation';
import { useStockData } from '../hooks/useStockData';
import type { Message, OptionChip, WidgetSlot } from '../types';
import AlertSummary from './AlertSummary';
import Composer from './Composer';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import NewsCards from './NewsCards';
import OptionMenu from './OptionMenu';
import PairsTable from './PairsTable';
import SpreadChart from './SpreadChart';
import SpreadTable from './SpreadTable';

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
  const { state, sendUserText, selectOption } = useConversation(getZ);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userHasReplied = state.messages.some((m) => m.speaker === 'user');

  useEffect(() => {
    if (!userHasReplied) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages, userHasReplied]);

  // The latest Sage message holds the active option menu.
  let latestSageId: string | null = null;
  for (let i = state.messages.length - 1; i >= 0; i -= 1) {
    if (state.messages[i].speaker === 'sage') {
      latestSageId = state.messages[i].id;
      break;
    }
  }

  return (
    <div className="chat">
      <div className="chat__scroll" ref={scrollRef}>
        <div className="chat__inner">
          {!userHasReplied ? (
            <EmptyState />
          ) : (
            state.messages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                isLatestSage={m.id === latestSageId}
                onPick={selectOption}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="chat__composer-wrap">
        <div className="chat__composer-inner">
          <Composer onSend={sendUserText} disabled={state.step === 'closed'} />
        </div>
      </div>
    </div>
  );
}
