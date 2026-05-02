import type { OptionChip, PairKey } from '../types';

export const SAGE_LINES = {
  greeting:
    "Hi! I am Sage. I can help you find correlated stock pairs, check spread behavior, explore news, and practice paper trading. What would you like to do?",
  greetingReply:
    "Hello! How can I help you today? I can find correlated stock pairs, check a spread, or set up alerts.",
  taskPrompt:
    "I can help you find correlated stock pairs, check how a pair's spread is behaving, or set up alerts. What would you like to do?",
  pairsIntro:
    'Here are three pairs that have moved together closely over the last 90 days. These stocks usually rise and fall in sync — when one drifts away from the other, it can be worth a closer look. Pick one to dig in.',
  windowPrompt:
    'You can compare them over a short window (30 days), a medium one (90 days), or a longer one (1 year). Which works for you?',
  spreadFeedback:
    "The table shows today's price gap vs. their historical average — if both numbers are close, the pair is behaving normally. The chart tracks that gap over time; the shaded band is the typical day-to-day range, and the dashed line is the average.",
  newsPrompt:
    'I found a couple of recent news items worth a look. Want to see them?',
  alertPrompt:
    "Want me to set up an alert so you'll know if the gap shifts meaningfully?",
  thresholdPrompt:
    "I'll alert you when the gap looks unusually large compared to historical norms, measured in standard deviation. How sensitive should I be?",
  methodPrompt: 'And how should I reach you — push, email, or SMS?',
  emailAddressPrompt: 'Can you share your email address?',
  followupPrompt: 'Anything else?',
  signoff: 'Great. Come back anytime to check pairs or adjust alerts.',
  sectorPrompt: 'Great! To get started, which sector would you like to focus on?',
};

export const SECTOR_CHIPS: OptionChip[] = [
  { id: 'sector:technology', label: 'Technology' },
  { id: 'sector:healthcare', label: 'Healthcare' },
  { id: 'sector:finance',    label: 'Finance' },
  { id: 'sector:consumer',   label: 'Consumer Goods' },
  { id: 'sector:other',      label: 'Other' },
];

export const SECTOR_PAIR_MAP: Record<string, PairKey[]> = {
  technology: ['AAPL_MSFT', 'NVDA_AMD', 'CRM_ORCL'],
  healthcare: ['JNJ_PFE', 'LLY_NVO', 'UNH_CVS'],
  finance:    ['V_MA', 'JPM_BAC', 'GS_MS'],
  consumer:   ['KO_PEP', 'WMT_TGT', 'HD_LOW'],
  other:      ['META_GOOGL', 'XOM_CVX', 'CAT_DE'],
};

export const SECTOR_ACK: Record<string, string> = {
  technology: 'Here are three closely correlated tech pairs. Pick one to dig in.',
  healthcare: 'Here are three healthcare pairs worth watching. Pick one to dig in.',
  finance:    'Here are three finance pairs that tend to move together. Pick one to dig in.',
  consumer:   'Here are three consumer pairs with strong historical correlation. Pick one to dig in.',
  other:      'Here are three pairs from other sectors. Pick one to dig in.',
};

export function detectSector(text: string): string {
  const t = text.toLowerCase();
  if (/tech|software|semicon|chip|apple|microsoft|nvidia|aapl|msft|nvda|amd/i.test(t)) return 'technology';
  if (/health|pharma|medic|drug|hospital|lilly|pfizer|jnj/i.test(t)) return 'healthcare';
  if (/financ|bank|credit|invest|payment|visa|jpmorgan|goldman/i.test(t)) return 'finance';
  if (/consumer|retail|food|beverage|grocery|coca|pepsi|walmart|target/i.test(t)) return 'consumer';
  return 'other';
}

export const PAIR_PICK_LINE: Partial<Record<PairKey, string>> = {
  V_MA: 'Good pick — Visa and Mastercard are two payment-network heavyweights with a long history of moving together.',
  KO_PEP:
    'Great choice — two beverage giants with a long history of moving together.',
  F_GM: 'Two Detroit heavyweights — these tend to track each other closely, especially around earnings and macro news.',
};

export type NewsItem = {
  ticker: string;
  headline: string;
  source: string;
  date: string;
  url?: string;
  image?: string;
  summary?: string;
};

export const PAIR_NEWS: Partial<Record<PairKey, NewsItem[]>> = {
  V_MA: [
    {
      ticker: 'V',
      headline:
        'Visa reported strong Q1 earnings, with analysts pointing to steady revenue growth across market conditions — generally positive for V.',
      source: 'Yahoo Finance',
      date: 'April 2026',
      summary: 'Steady revenue growth across market conditions signals a broadly positive outlook for Visa.',
    },
    {
      ticker: 'MA',
      headline:
        'Mastercard heads into Q1 earnings, with analysts watching margins and cross-border volume — a mixed setup for MA.',
      source: 'Yahoo Finance',
      date: 'April 2026',
      summary: 'Analysts are watching margin trends and cross-border volume as key signals for Mastercard this quarter.',
    },
  ],
  KO_PEP: [
    {
      ticker: 'KO',
      headline:
        'Coca-Cola reported Q1 results, with analysts noting resilient pricing power despite volume headwinds — broadly neutral for KO.',
      source: 'Yahoo Finance',
      date: 'April 2026',
      summary: 'Resilient pricing power offsets volume headwinds, leaving the outlook broadly neutral for Coca-Cola.',
    },
    {
      ticker: 'PEP',
      headline:
        'PepsiCo cut its annual guidance after a softer-than-expected quarter, citing tariff pressure and cautious consumers — a cautionary signal for PEP.',
      source: 'Yahoo Finance',
      date: 'April 2026',
      summary: 'Tariff pressure and cautious consumer spending drove a guidance cut, flagging downside risk for PepsiCo.',
    },
  ],
  F_GM: [
    {
      ticker: 'F',
      headline:
        'Ford is in talks with a Chinese automaker on technology sharing, which analysts are watching given tariff exposure — a mixed signal for F.',
      source: 'Yahoo Finance',
      date: 'April 2026',
      summary: 'Technology-sharing talks with a Chinese partner add uncertainty given Ford\'s tariff exposure.',
    },
    {
      ticker: 'GM',
      headline:
        'GM is set to report Q1 earnings, with analysts flagging tariff risks and consumer softness as the main uncertainties — a cautious setup for GM.',
      source: 'CNBC / Yahoo Finance',
      date: 'April 2026',
      summary: 'Tariff risks and softening consumer demand are the main uncertainties heading into GM\'s Q1 report.',
    },
  ],
};

// Plain-language verdict for the spread, derived from |z|.
export function verdictForZScore(z: number): string {
  const a = Math.abs(z);
  if (a < 0.5) return 'Right around the usual gap — nothing unusual today.';
  if (a < 1.0)
    return 'A touch off the usual gap, but well within normal day-to-day movement.';
  if (a < 1.5)
    return 'Slightly stretched compared to the typical range — worth keeping an eye on.';
  if (a < 2)
    return 'Wider than usual. This kind of move only happens about 1 in 7 days historically.';
  if (a < 3)
    return 'Significantly wider than usual — this is the ~5% tail of historical behavior.';
  return 'A major divergence — this is well outside the historical norm.';
}

// Greeting / sure / yes / no detection from utterances in sage_script.json.
const GREETING_RE =
  /^(hi|hey|hello|yo|sup|good\s*(morning|afternoon|evening)|greetings|sage|start|let'?s\s*begin|hi\s*there|talk\s*to\s*me|what'?s\s*up|can\s*we\s*talk)/i;

const YES_RE =
  /^(yes|yeah|yea|yep|yup|sure|ok(ay)?|sounds\s*good|do\s*it|go\s*ahead|please|absolutely|definitely|let'?s\s*do|let'?s\s*go|i'?m\s*ready|show\s*me|alert\s*me|notify\s*me|set\s*(it|that|an)|create|make|read|tell|bring|i\s*want)/i;

const NO_RE =
  /^(no|nope|nah|not?\s*now|i'?m\s*good|nothing|that'?s\s*it|that'?s\s*all|that\s*is\s*all|done|all\s*set|bye|good?bye|finished|good\s*for\s*now|no\s*thanks?|no\s*thank\s*you)/i;

export function isGreeting(text: string): boolean {
  const t = text.trim().toLowerCase();
  return GREETING_RE.test(t);
}

/** User picked Arbitrage Watchlist from the category empty-state. */
export function isArbitrageWatchlistPick(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return t === 'arbitrage watchlist';
}

const ACTION_REQUEST_RE =
  /\b(pair|pairs|spread|correlat|stock|analyz|find|check|compare|alert|show|look\s*(at|for)|tell\s*me|help\s*me|start|explore|view|see|get|want|what\s*are|behav|watchlist|arbitrage|diverge|trade|trading|ratio|gap|signal)\b/i;

export function isActionRequest(text: string): boolean {
  return ACTION_REQUEST_RE.test(text.trim()) || isYes(text);
}

export function isYes(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (NO_RE.test(t)) return false;
  return YES_RE.test(t);
}

export function isNo(text: string): boolean {
  const t = text.trim().toLowerCase();
  return NO_RE.test(t);
}

const PAIR_PHRASES: { pair: PairKey; phrases: RegExp[] }[] = [
  {
    pair: 'V_MA',
    phrases: [
      /\bvisa\b/i,
      /\bmastercard\b/i,
      /\bma\b/i,
      /\bv\s*(and|\+|\/|&)\s*ma\b/i,
      /\bcredit\s*card\b/i,
      /\bpayment\s*network/i,
      /\bfinance\s*pair\b/i,
    ],
  },
  {
    pair: 'KO_PEP',
    phrases: [
      /\bcoca[-\s]?cola\b/i,
      /\bcoke\b/i,
      /\bpepsi(co)?\b/i,
      /\bko\b/i,
      /\bpep\b/i,
      /\bsoda\b/i,
      /\bbeverage\b/i,
      /\bconsumer\s*goods\b/i,
    ],
  },
  {
    pair: 'F_GM',
    phrases: [
      /\bford\b/i,
      /\bgm\b/i,
      /\bgeneral\s*motors\b/i,
      /\bauto\s*pair\b/i,
      /\bcar\s*(stocks?|companies)\b/i,
      /\bdetroit\b/i,
      /\bindustrials?\b/i,
    ],
  },
];

export function detectPair(text: string): PairKey | null {
  for (const { pair, phrases } of PAIR_PHRASES) {
    if (phrases.some((re) => re.test(text))) return pair;
  }
  return null;
}

export function detectWindow(text: string): '30d' | '90d' | '1y' | null {
  const t = text.toLowerCase();
  if (
    /\b30\b|\bthirty\b|\b1\s*month\b|\bone\s*month\b|\bshort\b|\b30d\b/.test(t)
  )
    return '30d';
  if (/\b90\b|\bninety\b|\b3\s*months?\b|\bthree\s*months?\b|\bmedium\b|\b90d\b/.test(t))
    return '90d';
  if (
    /\b1\s*y(ea)?r?\b|\bone\s*year\b|\b12\s*months?\b|\btwelve\s*months?\b|\blong\b|\b1y\b|\bpast\s*year\b|\blast\s*year\b/.test(
      t
    )
  )
    return '1y';
  return null;
}

export function detectThreshold(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)/);
  if (m) {
    const n = parseFloat(m[1]);
    if (n > 0 && n <= 10) return n;
  }
  if (/\bone\s*and\s*a\s*half\b|\bone\s*point\s*five\b/i.test(text)) return 1.5;
  if (/\btwo\b/i.test(text)) return 2;
  if (/\bthree\b/i.test(text)) return 3;
  return null;
}

export function detectMethod(text: string): 'push' | 'email' | 'sms' | null {
  const t = text.toLowerCase();
  if (/\b(push|app\s*(notification|alert|push)|mobile|phone\s*push)\b/.test(t))
    return 'push';
  if (/\b(e[-\s]?mail|mail\s*me|inbox)\b/.test(t)) return 'email';
  if (/\b(sms|text|texting)\b/.test(t)) return 'sms';
  return null;
}

/** Loose but practical validation for typed email in chat (local@domain.tld). */
export function extractEmailAddress(text: string): string | null {
  const m = text.trim().match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return m ? m[0] : null;
}
