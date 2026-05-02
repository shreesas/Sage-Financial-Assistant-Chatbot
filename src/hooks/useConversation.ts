import { useCallback, useReducer } from 'react';
import { PAIRS, PAIR_ORDER, WINDOW_LABEL } from '../data/pairs';
import {
  PAIR_PICK_LINE,
  SAGE_LINES,
  detectMethod,
  detectPair,
  detectThreshold,
  detectWindow,
  isActionRequest,
  isGreeting,
  isNo,
  isYes,
} from '../data/sageFlow';
import type {
  Message,
  NotificationMethod,
  OptionChip,
  PairKey,
  WindowKey,
} from '../types';

type Step =
  | 'awaiting_greeting'
  | 'awaiting_task'
  | 'awaiting_pair'
  | 'awaiting_window'
  | 'awaiting_news_confirm'
  | 'awaiting_alert_confirm'
  | 'awaiting_threshold'
  | 'awaiting_threshold_custom'
  | 'awaiting_method'
  | 'awaiting_followup'
  | 'closed';

type State = {
  step: Step;
  messages: Message[];
  pair: PairKey | null;
  window: WindowKey | null;
  threshold: number | null;
  method: NotificationMethod | null;
  currentZ: number | null;
};

type Resolve = {
  resolveLastOptions?: string;
  push: Omit<Message, 'id'>[];
  patch?: Partial<State>;
};

type Action = {
  user?: { text: string };
  resolved?: Resolve;
};

const initialState: State = {
  step: 'awaiting_greeting',
  messages: [],
  pair: null,
  window: null,
  threshold: null,
  method: null,
  currentZ: null,
};

let _id = 0;
function nextId() {
  _id += 1;
  return `m${_id}`;
}

function reducer(state: State, action: Action): State {
  let next: State = { ...state };

  if (action.user) {
    next.messages = [
      ...next.messages,
      { id: nextId(), speaker: 'user', text: action.user.text },
    ];
  }

  if (action.resolved) {
    const { resolveLastOptions, push, patch } = action.resolved;

    if (resolveLastOptions) {
      next.messages = next.messages.map((m) =>
        m.options && !m.optionsResolved
          ? { ...m, optionsResolved: resolveLastOptions }
          : m
      );
    }

    if (push.length) {
      next.messages = [
        ...next.messages,
        ...push.map((m) => ({ id: nextId(), ...m })),
      ];
    }

    if (patch) {
      next = { ...next, ...patch };
    }
  }

  return next;
}

function pairChips(): OptionChip[] {
  return PAIR_ORDER.map((p) => {
    const meta = PAIRS[p];
    return {
      id: `pair:${p}`,
      label: `${meta.legA.name} & ${meta.legB.name}`,
    };
  });
}

function windowChips(): OptionChip[] {
  return [
    { id: 'window:30d', label: '30 days' },
    { id: 'window:90d', label: '90 days', primary: true },
    { id: 'window:1y', label: '1 year' },
  ];
}

function yesNoChips(): OptionChip[] {
  return [
    { id: 'yes', label: 'Yes', primary: true },
    { id: 'no', label: 'No' },
  ];
}

function thresholdChips(): OptionChip[] {
  return [
    { id: 'threshold:1.5', label: '1.5 — earlier' },
    { id: 'threshold:2', label: '2 — common', primary: true },
    { id: 'threshold:3', label: '3 — major' },
    { id: 'threshold:custom', label: 'Custom' },
  ];
}

function methodChips(): OptionChip[] {
  return [
    { id: 'method:push', label: 'Push' },
    { id: 'method:email', label: 'Email' },
    { id: 'method:sms', label: 'SMS' },
  ];
}

function followupChips(): OptionChip[] {
  return [
    { id: 'followup:yes', label: 'Yes, another pair' },
    { id: 'followup:no', label: "No, that's it", primary: true },
  ];
}

function methodLabel(m: NotificationMethod): string {
  if (m === 'push') return 'a push notification';
  if (m === 'email') return 'an email';
  return 'a text';
}

type GetZ = (pair: PairKey, window: WindowKey) => number | null;

export type ConversationApi = {
  state: State;
  sendUserText: (text: string) => void;
  selectOption: (chip: OptionChip) => void;
};

export function useConversation(getZ: GetZ): ConversationApi {
  const [state, dispatch] = useReducer(reducer, initialState, (s): State => {
    return {
      ...s,
      messages: [
        {
          id: nextId(),
          speaker: 'sage',
          text: SAGE_LINES.greeting,
        },
      ],
    };
  });

  const advanceFromPair = useCallback(
    (pair: PairKey, resolved?: string): Resolve => {
      return {
        resolveLastOptions: resolved,
        push: [
          {
            speaker: 'sage',
            text: `${PAIR_PICK_LINE[pair]} ${SAGE_LINES.windowPrompt}`,
            options: windowChips(),
          },
        ],
        patch: { step: 'awaiting_window', pair },
      };
    },
    []
  );

  const advanceFromWindow = useCallback(
    (pair: PairKey, window: WindowKey, resolved?: string): Resolve => {
      const z = getZ(pair, window) ?? 0;
      return {
        resolveLastOptions: resolved,
        push: [
          {
            speaker: 'sage',
            text: `Here's how ${PAIRS[pair].legA.name} and ${PAIRS[pair].legB.name} look right now over ${WINDOW_LABEL[window]}.`,
            slots: [
              { kind: 'spread', pair, window },
              { kind: 'chart', pair, window },
            ],
          },
          {
            speaker: 'sage',
            text: SAGE_LINES.spreadFeedback,
          },
          {
            speaker: 'sage',
            text: SAGE_LINES.newsPrompt,
            options: yesNoChips(),
          },
        ],
        patch: { step: 'awaiting_news_confirm', window, currentZ: z },
      };
    },
    [getZ]
  );

  const showNewsThenAlert = useCallback(
    (pair: PairKey, resolved?: string): Resolve => {
      return {
        resolveLastOptions: resolved,
        push: [
          {
            speaker: 'sage',
            text: 'Two recent stories worth a look:',
            slots: [{ kind: 'news', pair }],
          },
          {
            speaker: 'sage',
            text: SAGE_LINES.alertPrompt,
            options: yesNoChips(),
          },
        ],
        patch: { step: 'awaiting_alert_confirm' },
      };
    },
    []
  );

  const skipNewsAskAlert = useCallback((resolved?: string): Resolve => {
    return {
      resolveLastOptions: resolved,
      push: [
        {
          speaker: 'sage',
          text: `No problem. ${SAGE_LINES.alertPrompt}`,
          options: yesNoChips(),
        },
      ],
      patch: { step: 'awaiting_alert_confirm' },
    };
  }, []);

  const askThreshold = useCallback((resolved?: string): Resolve => {
    return {
      resolveLastOptions: resolved,
      push: [
        {
          speaker: 'sage',
          text: SAGE_LINES.thresholdPrompt,
          options: thresholdChips(),
        },
      ],
      patch: { step: 'awaiting_threshold' },
    };
  }, []);

  const askThresholdCustom = useCallback((resolved?: string): Resolve => {
    return {
      resolveLastOptions: resolved,
      push: [
        {
          speaker: 'sage',
          text: 'Sure — type the standard-deviation threshold you want (for example, 1.75).',
        },
      ],
      patch: { step: 'awaiting_threshold_custom' },
    };
  }, []);

  const askMethod = useCallback(
    (threshold: number, resolved?: string): Resolve => {
      return {
        resolveLastOptions: resolved,
        push: [
          {
            speaker: 'sage',
            text: SAGE_LINES.methodPrompt,
            options: methodChips(),
          },
        ],
        patch: { step: 'awaiting_method', threshold },
      };
    },
    []
  );

  const confirmAlert = useCallback(
    (
      pair: PairKey,
      threshold: number,
      method: NotificationMethod,
      currentZ: number | null,
      resolved?: string
    ): Resolve => {
      const z = currentZ ?? 0;
      const meta = PAIRS[pair];
      const proximity =
        Math.abs(z) >= threshold
          ? `They're already at ${z.toFixed(1)} now, which is at or past your threshold — so I'll fire as soon as the alert goes live.`
          : `They're at ${z.toFixed(1)} now, so it would take a meaningful move before you hear from me.`;
      const text = `All set. I'll send you ${methodLabel(method)} if ${meta.legA.name} and ${meta.legB.name} drift to ${threshold} standard deviations or more. ${proximity}`;
      return {
        resolveLastOptions: resolved,
        push: [
          {
            speaker: 'sage',
            text,
            slots: [
              {
                kind: 'alert',
                pair,
                threshold,
                method,
                currentZ: z,
              },
            ],
          },
          {
            speaker: 'sage',
            text: SAGE_LINES.followupPrompt,
            options: followupChips(),
          },
        ],
        patch: { step: 'awaiting_followup', method },
      };
    },
    []
  );

  const restart = useCallback((resolved?: string): Resolve => {
    return {
      resolveLastOptions: resolved,
      push: [
        {
          speaker: 'sage',
          text: 'Sure — pick another pair to dig into.',
          slots: [{ kind: 'pairs' }],
        },
      ],
      patch: {
        step: 'awaiting_pair',
        pair: null,
        window: null,
        threshold: null,
        method: null,
        currentZ: null,
      },
    };
  }, []);

  const close = useCallback((resolved?: string): Resolve => {
    return {
      resolveLastOptions: resolved,
      push: [{ speaker: 'sage', text: SAGE_LINES.signoff }],
      patch: { step: 'closed' },
    };
  }, []);

  const askAgain = useCallback(
    (text: string, options?: OptionChip[]): Resolve => ({
      push: [{ speaker: 'sage', text, options }],
    }),
    []
  );

  const handleInput = useCallback(
    (text: string, fromChip: boolean, chipLabel?: string): Resolve | null => {
      const resolved = fromChip ? chipLabel : undefined;
      const t = text.trim();
      if (!t) return null;

      switch (state.step) {
        case 'awaiting_greeting': {
          if (isGreeting(t) || isYes(t) || fromChip) {
            return {
              resolveLastOptions: resolved,
              push: [
                {
                  speaker: 'sage',
                  text: SAGE_LINES.greetingReply,
                },
              ],
              patch: { step: 'awaiting_task' },
            };
          }
          return askAgain(
            "Say hi when you're ready and I'll show you a few pairs to look at."
          );
        }

        case 'awaiting_task': {
          const directPair = detectPair(t);
          if (directPair) return advanceFromPair(directPair, resolved);
          if (isActionRequest(t)) {
            return {
              resolveLastOptions: resolved,
              push: [
                {
                  speaker: 'sage',
                  text: SAGE_LINES.pairsIntro,
                  slots: [{ kind: 'pairs' }],
                },
              ],
              patch: { step: 'awaiting_pair' },
            };
          }
          if (isNo(t)) return close(resolved);
          return askAgain(
            "I can find correlated stock pairs, check a spread, or set up an alert. What would you like to do?"
          );
        }

        case 'awaiting_pair': {
          const p = detectPair(t);
          if (p) return advanceFromPair(p, resolved);
          return askAgain(
            "I couldn't tell which pair you meant. Tap one of the chips or name a pair like 'Visa and Mastercard'.",
            pairChips()
          );
        }

        case 'awaiting_window': {
          if (!state.pair) return null;
          const w = detectWindow(t);
          if (w) return advanceFromWindow(state.pair, w, resolved);
          return askAgain(
            'Pick a window — short (30 days), medium (90 days), or long (1 year).',
            windowChips()
          );
        }

        case 'awaiting_news_confirm': {
          if (!state.pair) return null;
          if (isYes(t)) return showNewsThenAlert(state.pair, resolved);
          if (isNo(t)) return skipNewsAskAlert(resolved);
          return askAgain('Want to see the news? Yes or no works.', yesNoChips());
        }

        case 'awaiting_alert_confirm': {
          if (isYes(t)) return askThreshold(resolved);
          if (isNo(t)) {
            return {
              resolveLastOptions: resolved,
              push: [
                {
                  speaker: 'sage',
                  text: `Got it — no alert for now. ${SAGE_LINES.followupPrompt}`,
                  options: followupChips(),
                },
              ],
              patch: { step: 'awaiting_followup' },
            };
          }
          return askAgain(
            'Set up an alert? Yes or no works.',
            yesNoChips()
          );
        }

        case 'awaiting_threshold': {
          if (/custom/i.test(t)) return askThresholdCustom(resolved);
          const n = detectThreshold(t);
          if (n != null) return askMethod(n, resolved);
          return askAgain(
            'Pick a threshold — 1.5, 2, 3, or a custom number.',
            thresholdChips()
          );
        }

        case 'awaiting_threshold_custom': {
          const n = detectThreshold(t);
          if (n != null) return askMethod(n);
          return askAgain('Type a number, like 1.75 or 2.5.');
        }

        case 'awaiting_method': {
          if (
            !state.pair ||
            state.threshold == null
          )
            return null;
          const m = detectMethod(t);
          if (m)
            return confirmAlert(
              state.pair,
              state.threshold,
              m,
              state.currentZ,
              resolved
            );
          return askAgain(
            'Push, email, or SMS — whichever works best.',
            methodChips()
          );
        }

        case 'awaiting_followup': {
          if (isNo(t)) return close(resolved);
          if (isYes(t) || /another|pair|new/i.test(t)) return restart(resolved);
          return askAgain(
            'Anything else? Yes or no works.',
            followupChips()
          );
        }

        case 'closed':
          return null;
      }
      return null;
    },
    [
      state,
      askAgain,
      advanceFromPair,
      advanceFromWindow,
      showNewsThenAlert,
      skipNewsAskAlert,
      askThreshold,
      askThresholdCustom,
      askMethod,
      confirmAlert,
      restart,
      close,
    ]
  );

  const sendUserText = useCallback(
    (text: string) => {
      const resolved = handleInput(text, false);
      dispatch({ user: { text }, resolved: resolved ?? undefined });
    },
    [handleInput]
  );

  const selectOption = useCallback(
    (chip: OptionChip) => {
      const id = chip.id;
      let asText = chip.label;

      // Translate chip ids into the input handler's expected text.
      if (id === 'yes') asText = 'Yes';
      else if (id === 'no') asText = 'No';
      else if (id.startsWith('pair:')) {
        const pk = id.slice('pair:'.length) as PairKey;
        asText = `${PAIRS[pk].legA.name} and ${PAIRS[pk].legB.name}`;
      } else if (id.startsWith('window:')) {
        const w = id.slice('window:'.length);
        asText = w === '1y' ? '1 year' : w === '90d' ? '90 days' : '30 days';
      } else if (id.startsWith('threshold:')) {
        asText = id.slice('threshold:'.length);
      } else if (id.startsWith('method:')) {
        asText = id.slice('method:'.length);
      } else if (id.startsWith('followup:')) {
        asText = id === 'followup:no' ? 'No' : 'Yes';
      }

      const resolved = handleInput(asText, true, chip.label);
      dispatch({
        user: { text: chip.label },
        resolved: resolved ?? undefined,
      });
    },
    [handleInput]
  );

  return { state, sendUserText, selectOption };
}
