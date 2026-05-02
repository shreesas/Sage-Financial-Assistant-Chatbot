// Regenerates public/sage_script.json from public/stock_data.json.
//
// Strategy: deterministic — the spread/correlation/std-dev/z-score values
// already live in stock_data.json's `calculated_data` block. This script
// just (a) pulls the latest closing price for each ticker, (b) joins it
// with the stats for each pair × window, and (c) renders the Sage data
// turn as a structured `byWindow` field with both natural-language prose
// and a UI-ready `table` payload (caption + columns + rows + stats).
//
// Run with:  node scripts/generate-sage-script.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

const STOCK_PATH = resolve(PUBLIC, 'stock_data.json');
const SCRIPT_PATH = resolve(PUBLIC, 'sage_script.json');

const stockRaw = readFileSync(STOCK_PATH, 'utf8').replace(/:\s*NaN/g, ':null');
const stock = JSON.parse(stockRaw);

const latestClose = (key) => {
  const rows = stock[key] || [];
  for (const row of rows) {
    if (typeof row?.Close === 'number' && Number.isFinite(row.Close)) {
      return row.Close;
    }
  }
  return null;
};

const fmtPrice = (n) =>
  n == null
    ? '—'
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtMoney = (s) => (typeof s === 'string' ? s : fmtPrice(s));

// 0.83 -> "8 out of 10 days"
const togetherDays = (corr) => `${Math.round(corr * 10)} out of 10 days`;

// Plain-language interpretation of the spread, derived from |z| and the
// direction (positive/negative). Mirrors the bands used by
// verdictForZScore() in src/data/sageFlow.ts so the script and the
// runtime UI stay aligned.
const spreadProse = (z) => {
  const a = Math.abs(z);
  const dir = z >= 0 ? 'wider' : 'narrower';
  if (a < 0.5)
    return 'The gap is right around the usual range — these two are behaving like they normally do.';
  if (a < 1.0)
    return `The gap is a touch ${dir} than usual, but well within normal day-to-day movement.`;
  if (a < 1.5)
    return `The gap is slightly ${dir} than usual — worth keeping an eye on.`;
  if (a < 2)
    return `The gap is meaningfully ${dir} than usual. This kind of move only happens about 1 in 7 days historically.`;
  if (a < 3)
    return `The gap is significantly ${dir} than usual — this is the ~5% tail of historical behavior.`;
  return `The gap is ${dir} than usual by a lot — well outside the historical norm, a major divergence.`;
};

const PAIRS = [
  {
    id: 'pair_a',
    title: 'Visa + Mastercard',
    category: 'Finance',
    a: { ticker: 'V', name: 'Visa', stockKey: 'visa' },
    b: { ticker: 'MA', name: 'Mastercard', stockKey: 'mastercard' },
    calcKey: 'V / MA',
    pairPickedLine:
      'Good pick! You can compare them over a short window (30 days), a medium one (90 days), or a longer one (1 year). Which works for you?',
    pairUserLine: {
      message: 'Visa and Mastercard.',
      utterances: [
        'Visa and Mastercard.', 'Show me Visa and Mastercard.', "Let's look at Visa and Mastercard.", 'V and MA.', 'Visa + Mastercard.',
        'The finance pair.', 'The credit card pair.', 'I pick Visa and Mastercard.', 'Number 3.', 'The third one.',
        'Visa.', 'Mastercard.', 'Compare Visa and Mastercard.', 'V & MA.', 'How about Visa and Mastercard?',
        'Can we check Visa and Mastercard?', 'Visa and MC.', 'The payment networks.', 'The last one.', 'Visa Mastercard.',
      ],
    },
    news: [
      {
        ticker: 'V',
        text: 'Visa reported strong Q1 earnings, with analysts pointing to steady revenue growth across market conditions — generally positive for V.',
        source: 'Yahoo Finance',
        date: 'April 2026',
      },
      {
        ticker: 'MA',
        text: 'Mastercard is heading into Q1 earnings, with analysts watching margins and cross-border volume — a mixed setup for MA.',
        source: 'Yahoo Finance',
        date: 'April 2026',
      },
    ],
    method: {
      key: 'email',
      userMessage: 'Email.',
      utterances: [
        'Email.', 'Email me.', 'Send an email.', 'By email.', 'Via email.',
        'To my email.', 'Shoot me an email.', 'Email notification.', 'Email please.', 'Email works.',
        'Use email.', 'Send to email.', 'Over email.', 'Just email.', 'Email is fine.',
        "Let's do email.", 'E-mail.', 'Send it to my email.', 'Alert via email.', 'Mail me.',
      ],
      verb: "I'll email you",
    },
    threshold: { value: 2, currentZ: 0.5 },
  },
  {
    id: 'pair_b',
    title: 'Coca-Cola + Pepsi',
    category: 'Consumer Goods',
    a: { ticker: 'KO', name: 'Coca-Cola', stockKey: 'coca_cola' },
    b: { ticker: 'PEP', name: 'PepsiCo', stockKey: 'pepsico' },
    calcKey: 'KO / PEP',
    pairPickedLine:
      'Great choice — two beverage giants with a long history of moving together. You can compare them over a short window (30 days), a medium one (90 days), or a longer view (1 year). Which works for you?',
    pairUserLine: {
      message: 'Coca-Cola and Pepsi.',
      utterances: [
        'Coca-Cola and Pepsi.', 'Coke and Pepsi.', 'KO and PEP.', 'The beverage giants.', 'Consumer goods.',
        'The first one.', 'Number one.', "Let's do Coke and Pepsi.", 'Show me Coca-Cola and Pepsi.', 'Compare Coke and Pepsi.',
        'The soda pair.', 'Coke/Pepsi.', 'Coca-Cola please.', 'Pepsi please.', 'The consumer goods pair.',
        "Let's look at Coca Cola.", 'Give me Coke and Pepsi.', 'Soda stocks.', 'The drinks.', 'First option.',
      ],
    },
    news: [
      {
        ticker: 'KO',
        text: 'Coca-Cola reported Q1 results, with analysts noting resilient pricing power despite volume headwinds — broadly neutral for KO.',
        source: 'Yahoo Finance',
        date: 'April 2026',
      },
      {
        ticker: 'PEP',
        text: 'PepsiCo cut its annual guidance after a softer-than-expected quarter, citing tariff pressure and cautious consumers — a cautionary signal for PEP.',
        source: 'Yahoo Finance',
        date: 'April 2026',
      },
    ],
    method: {
      key: 'push',
      userMessage: 'Push notification.',
      utterances: [
        'Push.', 'Push notification.', 'App notification.', 'Send a push.', 'Phone push.',
        'App alert.', 'Push alert.', 'Send me a push.', 'Push notification please.', 'Via push.',
        'Through the app.', 'App push.', 'Push is fine.', 'Do a push notification.', 'Just push.',
        'Push works.', 'Mobile notification.', 'Send it to my phone.', 'Alert via push.', 'Push me.',
      ],
      verb: "I'll send a push",
    },
    threshold: { value: 3, currentZ: 0.8 },
  },
  {
    id: 'pair_c',
    title: 'Ford + General Motors',
    category: 'Industrials',
    a: { ticker: 'F', name: 'Ford', stockKey: 'ford' },
    b: { ticker: 'GM', name: 'General Motors', stockKey: 'gm' },
    calcKey: 'F / GM',
    pairPickedLine:
      'Two Detroit heavyweights — these tend to track each other closely, especially around earnings and macro news. You can compare them over a short window (30 days), a medium one (90 days), or a longer view (1 year). Which works for you?',
    pairUserLine: {
      message: 'Ford and GM.',
      utterances: [
        'Ford and General Motors.', 'Ford and GM.', 'F and GM.', 'The car companies.', 'Industrials.',
        'The second one.', 'Number two.', "Let's do Ford and GM.", 'Show me Ford and GM.', 'Compare Ford and General Motors.',
        'Detroit heavyweights.', 'The auto pair.', 'Ford/GM.', 'Ford please.', 'GM please.',
        'The industrials pair.', "Let's look at Ford.", 'Give me Ford and GM.', 'Car stocks.', 'Second option.',
      ],
    },
    news: [
      {
        ticker: 'F',
        text: 'Ford is in talks with a Chinese automaker on technology sharing, which analysts are watching given tariff exposure — a mixed signal for F.',
        source: 'Yahoo Finance',
        date: 'April 2026',
      },
      {
        ticker: 'GM',
        text: 'GM is set to report Q1 earnings, with analysts flagging tariff risks and consumer softness as the main uncertainties — a cautious setup for GM.',
        source: 'CNBC / Yahoo Finance',
        date: 'April 2026',
      },
    ],
    method: {
      key: 'sms',
      userMessage: 'SMS.',
      utterances: [
        'SMS.', 'Text.', 'Text message.', 'Send a text.', 'Text me.',
        'Via text.', 'Phone text.', 'Shoot me a text.', 'SMS please.', 'SMS works.',
        'Use SMS.', 'Send to phone.', 'Over text.', 'Just text.', 'SMS is fine.',
        "Let's do SMS.", 'Send an SMS.', 'Send it via text.', 'Alert via text.', 'Text my phone.',
      ],
      verb: "I'll text you",
    },
    threshold: { value: 2, currentZ: 1.1 },
  },
];

const WINDOW_LABEL = {
  '30-day': { key: '30d', short: '30 days', captionWindow: '30-day', long: 'last 30 days' },
  '90-day': { key: '90d', short: '90 days', captionWindow: '90-day', long: 'last 90 days' },
  '1-year': { key: '1y', short: '1 year', captionWindow: '1-year', long: 'last 12 months' },
};

const EMAIL_DEMO = 'investor.demo@example.com';

const EMAIL_ADDRESS_TURNS = (pair) =>
  pair.method.key === 'email'
    ? [
        {
          speaker: 'Sage',
          message: 'Can you share your email address?',
        },
        {
          speaker: 'User',
          message: EMAIL_DEMO,
          utterances: [
            EMAIL_DEMO,
            `Sure — ${EMAIL_DEMO}`,
            `Use ${EMAIL_DEMO}.`,
            `My email is ${EMAIL_DEMO}.`,
            `It's ${EMAIL_DEMO}.`,
            `Send alerts to ${EMAIL_DEMO}.`,
            `Reach me at ${EMAIL_DEMO}.`,
          ],
        },
      ]
    : [];

const WINDOW_USER_UTTERANCES = {
  '30d': [
    '30 days.', '30.', 'Thirty days.', 'Short.', 'The short one.',
    '1 month.', 'One month.', '30 day window.', 'Short window.', 'Look at 30 days.',
    'Show me 30 days.', '30-day.', 'One month window.', 'Last 30 days.', 'Past 30 days.',
    '30d.', 'Short view.', 'For 30 days.', '30 days please.', "Let's do 30 days.",
  ],
  '90d': [
    '90 days.', '90.', 'Ninety days.', '3 months.', 'Three months.',
    'Medium.', 'The medium one.', '90 days please.', "Let's do 90 days.", '90 day window.',
    'Medium window.', 'Look at 90 days.', 'Show me 90 days.', '90-day.', 'Three month window.',
    'Last 90 days.', 'Past 90 days.', '90d.', 'Medium view.', 'For 90 days.',
  ],
  '1y': [
    '1 year.', 'One year.', '1 yr.', '12 months.', 'Twelve months.',
    'Long.', 'The long one.', 'Longer view.', '1 year window.', 'Long window.',
    'Look at 1 year.', 'Show me 1 year.', '1-year.', 'Twelve month window.', 'Last year.',
    'Past year.', '1y.', 'Long view.', 'For 1 year.', 'One year please.',
  ],
};

const calcByPair = new Map();
for (const row of stock.calculated_data) {
  const arr = calcByPair.get(row.Pair) ?? [];
  arr.push(row);
  calcByPair.set(row.Pair, arr);
}

const buildSpreadEntry = (pair, calcRow) => {
  const winLabel = WINDOW_LABEL[calcRow.Window];
  const aPrice = latestClose(pair.a.stockKey);
  const bPrice = latestClose(pair.b.stockKey);
  const higher = bPrice >= aPrice ? pair.b : pair.a;
  const lower = bPrice >= aPrice ? pair.a : pair.b;
  const higherPrice = bPrice >= aPrice ? bPrice : aPrice;
  const lowerPrice = bPrice >= aPrice ? aPrice : bPrice;
  const gapMagnitude = Math.round(higherPrice - lowerPrice);

  const verdict = spreadProse(calcRow['Z-score']);

  const message =
    `${higher.name} is currently about $${gapMagnitude} more expensive than ${lower.name}. ` +
    `${verdict}\n` +
    `I found a couple of recent news items worth a look. Want to see them?`;

  const table = {
    caption: `${pair.a.name} vs ${pair.b.name} — ${winLabel.captionWindow} window`,
    columns: ['', `${pair.a.name} (${pair.a.ticker})`, `${pair.b.name} (${pair.b.ticker})`],
    rows: [['Today\u2019s price', fmtPrice(aPrice), fmtPrice(bPrice)]],
    stats: [
      { label: 'Current gap', value: fmtMoney(calcRow['Current Spread']) },
      { label: 'Typical gap', value: fmtMoney(calcRow['Mean Spread']) },
      { label: 'Typical wiggle (1 std)', value: fmtMoney(calcRow['Std Dev']) },
      { label: 'Z-score', value: calcRow['Z-score'].toFixed(2) },
      { label: 'Correlation', value: calcRow.Correlation.toFixed(2) },
      { label: 'How often they move together', value: togetherDays(calcRow.Correlation) },
    ],
    source: {
      pair: calcRow.Pair,
      window: calcRow.Window,
    },
  };

  return { message, table };
};

const buildScript = (pair) => {
  const calcRows = calcByPair.get(pair.calcKey) ?? [];
  const byWindow = {};
  for (const row of calcRows) {
    const wl = WINDOW_LABEL[row.Window];
    if (!wl) continue;
    byWindow[wl.key] = buildSpreadEntry(pair, row);
  }

  const dialogue = [
    {
      speaker: 'User',
      message: 'Hey Sage.',
      utterances: [
        'Hey Sage.', 'Hi Sage.', 'Hello Sage.', 'Yo Sage.', 'Sage, are you there?',
        'Good morning, Sage.', 'Good afternoon, Sage.', 'Greetings, Sage.',
        'Hey.', 'Hi.', 'Hello.', 'Sage.', 'Start.', "Let's begin.",
        'Can we talk?', 'Hey assistant.', 'Hi there.', 'Yo.',
        "What's up, Sage?", 'Talk to me, Sage.','Start',
      ],
    },
    {
      speaker: 'Sage',
      message:
        "Hi, I'm Sage. I can help you find correlated stock pairs, check how a pair's spread is behaving, or set up alerts. What would you like to do?",
    },
    {
      speaker: 'User',
      message: 'Sure.',
      utterances: [
        'Sure.', 'Yeah.', 'Yes.', 'Okay.', 'Do it.',
        'Go ahead.', 'Why not.', 'Sounds good.', 'Yup.', 'Yea.',
        'Please do.', 'Absolutely.', 'Definitely.', 'Sure thing.', 'OK.',
        'Yep.', "Let's do it.", "I'm ready.", 'Show me.', 'Yes please.',
      ],
    },
    {
      speaker: 'Sage',
      message:
        'Here are three pairs that have moved together closely over the last 90 days:\n' +
        'Coca-Cola and Pepsi (Consumer Goods)\n' +
        'Ford and General Motors (Industrials)\n' +
        'Visa and Mastercard (Finance)\n' +
        'These are stocks that usually rise and fall in sync, so when one drifts away from the other, it can be worth a closer look. Want to take a closer look at one?',
    },
    { speaker: 'User', ...pair.pairUserLine },
    { speaker: 'Sage', message: pair.pairPickedLine },
    {
      speaker: 'User',
      intent: 'window',
      windows: {
        '30d': { message: '30 days.', utterances: WINDOW_USER_UTTERANCES['30d'] },
        '90d': { message: '90 days.', utterances: WINDOW_USER_UTTERANCES['90d'] },
        '1y': { message: '1 year.', utterances: WINDOW_USER_UTTERANCES['1y'] },
      },
    },
    {
      speaker: 'Sage',
      intent: 'spread',
      preamble: `Here's how ${pair.a.name} and ${pair.b.name} look right now:`,
      byWindow,
    },
    {
      speaker: 'User',
      message: 'Yes.',
      utterances: [
        'Yes.', 'Yeah.', 'Show me.', 'What is the news?', "What's the news?",
        'Read it.', 'Tell me.', 'Sure.', 'Okay.', 'Yes please.',
        'Bring it up.', 'Show me the news.', 'Read them.', 'Yep.', 'Yea.',
        'Do it.', "Let's hear it.", 'I want to see.', 'Show the stories.', 'Yes I do.',
      ],
    },
    {
      speaker: 'Sage',
      message:
        'Two recent stories:\n' +
        pair.news
          .map((n) => {
            const name =
              n.ticker === pair.a.ticker
                ? pair.a.name
                : n.ticker === pair.b.ticker
                ? pair.b.name
                : n.ticker;
            return `${name}: ${n.text} (${n.source}, ${n.date})`;
          })
          .join('\n') +
        "\nWant me to set up an alert so you'll know if the gap shifts meaningfully?",
    },
    {
      speaker: 'User',
      message: 'Yes.',
      utterances: [
        'Yes.', 'Set an alert.', 'Create alert.', 'Make an alert.', 'Do it.',
        'Set it up.', 'Please set an alert.', 'Yeah.', 'Sure.', 'Okay.',
        'Yes please.', 'Alert me.', 'Notify me.', 'Yes set it.', 'Set that up.',
        "Let's do an alert.", 'Make it happen.', 'Yes I want an alert.', 'Yea.', 'Yep.',
      ],
    },
    {
      speaker: 'Sage',
      message:
        "I'll alert you when a gap looks unusually large compared to historical norms, measured in standard deviation. How sensitive should I be? A higher threshold means fewer, bigger alerts.\n" +
        "2 — you'd hear from me on a small further widening (common choice)\n" +
        '3 — only a major divergence would trigger it\n' +
        'Or pick your own number',
    },
    {
      speaker: 'User',
      message: `${pair.threshold.value}.`,
      utterances:
        pair.threshold.value === 2
          ? [
              '2.', 'Two.', 'Number 2.', 'Option 2.', 'Level 2.',
              'Small widening.', 'Two please.', 'Set to 2.', 'Two standard deviations.', 'The common choice.',
              'I pick 2.', 'Make it 2.', 'Two is fine.', '2 works.', 'Use 2.',
              "Let's go with 2.", 'Second option.', 'Level two.', "I'll do 2.", 'Just 2.',
            ]
          : [
              '3.', 'Three.', 'Number 3.', 'Option 3.', 'Level 3.',
              'Major divergence.', 'Three please.', 'Set to 3.', 'Three standard deviations.', 'I pick 3.',
              'Make it 3.', 'Three is fine.', '3 works.', 'Use 3.', "Let's go with 3.",
              'Third option.', 'Level three.', "I'll do 3.", 'Just 3.', 'Only on major divergence.',
            ],
    },
    {
      speaker: 'Sage',
      message: 'And how should I reach you, push notification, email, or SMS?',
    },
    {
      speaker: 'User',
      message: pair.method.userMessage,
      utterances: pair.method.utterances,
    },
    ...EMAIL_ADDRESS_TURNS(pair),
    {
      speaker: 'Sage',
      message:
        `All set. ${pair.method.verb} if ${pair.a.name} and ${pair.b.name} drift to ${pair.threshold.value} standard deviations or more. ` +
        `They're at ${pair.threshold.currentZ} now, so it would take a meaningful move before you hear from me.\n` +
        'Anything else?',
    },
    {
      speaker: 'User',
      message: "No, that's it.",
      utterances: [
        "No, that's it.", "I'm good.", 'No thanks.', 'Nothing else.', "That's all.",
        'Nope.', "We're done.", 'I am good.', 'That is all.', 'Nothing.',
        'Bye.', 'No.', "I'm finished.", 'All set.', 'Done for now.',
        'No thank you.', "That's everything.", 'Good for now.', "Nope that's it.", 'Thanks, goodbye.',
      ],
    },
    {
      speaker: 'Sage',
      message: 'Great. Come back anytime to check pairs or adjust alerts.',
    },
  ];

  return {
    id: pair.id,
    title: pair.title,
    category: pair.category,
    tickers: { a: pair.a.ticker, b: pair.b.ticker },
    dialogue,
  };
};

const out = { scripts: PAIRS.map(buildScript) };

writeFileSync(SCRIPT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

const total = out.scripts.length;
const totalSpread = out.scripts.reduce((acc, s) => {
  const turn = s.dialogue.find((t) => t.intent === 'spread');
  return acc + (turn ? Object.keys(turn.byWindow || {}).length : 0);
}, 0);
console.log(`Wrote ${SCRIPT_PATH}`);
console.log(`  scripts: ${total}, spread responses: ${totalSpread}`);
