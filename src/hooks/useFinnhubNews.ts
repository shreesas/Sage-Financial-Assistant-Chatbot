import { useEffect, useState } from 'react';
import { PAIRS } from '../data/pairs';
import { PAIR_NEWS, type NewsItem } from '../data/sageFlow';
import type { PairKey } from '../types';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;

// Per-pair cache and in-flight deduplication
const pairCache = new Map<PairKey, NewsItem[]>();
const pairInflight = new Map<PairKey, Promise<NewsItem[]>>();

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function unixToDateString(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

type FinnhubArticle = {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  image: string;
  summary: string;
};

async function fetchTickerNews(
  ticker: string,
  from: string,
  to: string,
  token: string
): Promise<FinnhubArticle[]> {
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${token}`
  );
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${ticker}`);
  return res.json() as Promise<FinnhubArticle[]>;
}

function topArticle(articles: FinnhubArticle[], ticker: string): NewsItem | null {
  if (!articles.length) return null;
  const top = [...articles].sort((a, b) => b.datetime - a.datetime)[0];
  return {
    ticker,
    headline: top.headline,
    source: top.source,
    date: unixToDateString(top.datetime),
    url: top.url,
    image: top.image || undefined,
    summary: top.summary || undefined,
  };
}

async function loadPairNews(pair: PairKey): Promise<NewsItem[]> {
  const meta = PAIRS[pair];
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fromStr = isoDate(from);
  const toStr = isoDate(to);
  const token = API_KEY!;

  const [resA, resB] = await Promise.allSettled([
    fetchTickerNews(meta.legA.ticker, fromStr, toStr, token),
    fetchTickerNews(meta.legB.ticker, fromStr, toStr, token),
  ]);

  const items: NewsItem[] = [];
  if (resA.status === 'fulfilled') {
    const item = topArticle(resA.value, meta.legA.ticker);
    if (item) items.push(item);
  }
  if (resB.status === 'fulfilled') {
    const item = topArticle(resB.value, meta.legB.ticker);
    if (item) items.push(item);
  }

  // Fall back to static news if Finnhub returned nothing for this pair
  return items.length > 0 ? items : (PAIR_NEWS[pair] ?? []);
}

export type FinnhubNewsResult = {
  items: NewsItem[];
  loading: boolean;
};

export function useFinnhubNews(pair: PairKey): FinnhubNewsResult {
  const [items, setItems] = useState<NewsItem[]>(
    () => pairCache.get(pair) ?? PAIR_NEWS[pair] ?? []
  );
  const [loading, setLoading] = useState(!pairCache.has(pair) && !!API_KEY);

  useEffect(() => {
    // Already cached — use it immediately
    if (pairCache.has(pair)) {
      setItems(pairCache.get(pair)!);
      setLoading(false);
      return;
    }

    // No API key — stay on static news
    if (!API_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Attach to an existing in-flight request for this pair, or start a new one
    const p = pairInflight.get(pair) ?? loadPairNews(pair);
    if (!pairInflight.has(pair)) pairInflight.set(pair, p);

    p.then((result) => {
      pairCache.set(pair, result);
      pairInflight.delete(pair);
      if (!cancelled) { setItems(result); setLoading(false); }
    }).catch(() => {
      pairInflight.delete(pair);
      const fallback = PAIR_NEWS[pair] ?? [];
      pairCache.set(pair, fallback);
      if (!cancelled) { setItems(fallback); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [pair]);

  return { items, loading };
}
