import { useEffect, useState } from 'react';
import { PAIR_NEWS, type NewsItem } from '../data/sageFlow';
import type { PairKey } from '../types';

type NewsMap = Record<PairKey, NewsItem[]>;

const TICKER_TO_PAIR: Record<string, PairKey> = {
  V: 'V_MA',
  MA: 'V_MA',
  KO: 'KO_PEP',
  PEP: 'KO_PEP',
  F: 'F_GM',
  GM: 'F_GM',
};

const TICKERS = Object.keys(TICKER_TO_PAIR) as (keyof typeof TICKER_TO_PAIR)[];

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;

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
  related: string;
  url: string;
};

async function fetchTickerNews(
  ticker: string,
  from: string,
  to: string,
  token: string
): Promise<FinnhubArticle[]> {
  const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${ticker}`);
  return res.json() as Promise<FinnhubArticle[]>;
}

export type FinnhubNewsResult = {
  news: NewsMap;
  loading: boolean;
};

let cached: NewsMap | null = null;

export function useFinnhubNews(): FinnhubNewsResult {
  const [news, setNews] = useState<NewsMap>(() => cached ?? PAIR_NEWS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    if (!API_KEY) {
      setLoading(false);
      return;
    }

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const fromStr = isoDate(from);
    const toStr = isoDate(to);

    let cancelled = false;

    Promise.allSettled(
      TICKERS.map((ticker) => fetchTickerNews(ticker, fromStr, toStr, API_KEY))
    ).then((results) => {
      if (cancelled) return;

      const accumulated: Partial<Record<PairKey, NewsItem[]>> = {};

      results.forEach((result, i) => {
        const ticker = TICKERS[i];
        const pairKey = TICKER_TO_PAIR[ticker];

        if (result.status !== 'fulfilled' || result.value.length === 0) return;

        // Sort by newest first, pick the top article for this ticker.
        const sorted = [...result.value].sort((a, b) => b.datetime - a.datetime);
        const top = sorted[0];

        const item: NewsItem = {
          ticker,
          headline: top.headline,
          source: top.source,
          date: unixToDateString(top.datetime),
          url: top.url,
        };

        if (!accumulated[pairKey]) accumulated[pairKey] = [];
        accumulated[pairKey]!.push(item);
      });

      // Build final map: use live data where available, fall back to static otherwise.
      const merged: NewsMap = {
        V_MA: accumulated.V_MA?.length ? accumulated.V_MA : PAIR_NEWS.V_MA,
        KO_PEP: accumulated.KO_PEP?.length ? accumulated.KO_PEP : PAIR_NEWS.KO_PEP,
        F_GM: accumulated.F_GM?.length ? accumulated.F_GM : PAIR_NEWS.F_GM,
      };

      cached = merged;
      setNews(merged);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { news, loading };
}
