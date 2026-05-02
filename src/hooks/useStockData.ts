import { useEffect, useMemo, useState } from 'react';
import {
  PAIRS,
  WINDOW_CALC_LABEL,
  WINDOW_TRADING_DAYS,
} from '../data/pairs';
import type {
  PairKey,
  PriceRow,
  RawCalcRow,
  RawPriceRow,
  SpreadStats,
  StockDataFile,
  StockDatasetKey,
  WindowKey,
} from '../types';

let cache: StockDataFile | null = null;
let inflight: Promise<StockDataFile> | null = null;

function load(): Promise<StockDataFile> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  // We use .text() + manual JSON.parse so we can repair the bare `NaN`
  // tokens the upstream data generator sometimes emits — those are not
  // legal JSON and would otherwise cause r.json() to reject silently,
  // leaving every consuming widget stuck in its loading state.
  inflight = fetch(`${import.meta.env.BASE_URL}stock_data.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load stock_data.json (${r.status})`);
      return r.text();
    })
    .then((raw) => {
      const sanitized = raw.replace(/:\s*NaN\b/g, ': null');
      try {
        const parsed = JSON.parse(sanitized) as StockDataFile;
        cache = parsed;
        inflight = null;
        return parsed;
      } catch (e) {
        inflight = null;
        throw new Error(
          `stock_data.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

function parseMoney(s: string): number {
  return parseFloat(s.replace(/[$,]/g, ''));
}

function normalize(rows: RawPriceRow[]): PriceRow[] {
  // The JSON is newest-first; rebuild ascending by index order then reverse.
  const mapped = rows
    .map((r) => ({
      date: r.Date,
      close:
        typeof r.Close === 'number' ? r.Close : parseFloat(String(r.Close)),
    }))
    .filter((r) => Number.isFinite(r.close));
  return mapped.slice().reverse();
}

export type PairSeries = {
  legA: PriceRow[];
  legB: PriceRow[];
  spread: { date: string; value: number }[];
};

function takeWindow(series: PriceRow[], n: number): PriceRow[] {
  if (series.length <= n) return series;
  return series.slice(series.length - n);
}

function buildSeries(
  legARows: RawPriceRow[],
  legBRows: RawPriceRow[],
  window: WindowKey
): PairSeries {
  const a = normalize(legARows);
  const b = normalize(legBRows);
  const days = WINDOW_TRADING_DAYS[window];

  // Align by date intersection.
  const bByDate = new Map(b.map((r) => [r.date, r.close]));
  const merged: { date: string; aClose: number; bClose: number }[] = [];
  for (const ra of a) {
    const bClose = bByDate.get(ra.date);
    if (bClose != null) {
      merged.push({ date: ra.date, aClose: ra.close, bClose });
    }
  }
  const windowed = merged.slice(Math.max(0, merged.length - days));
  const legA = windowed.map((r) => ({ date: r.date, close: r.aClose }));
  const legB = windowed.map((r) => ({ date: r.date, close: r.bClose }));
  const spread = windowed.map((r) => ({
    date: r.date,
    value: r.bClose - r.aClose,
  }));
  return { legA, legB, spread };
}

function findCalc(
  rows: RawCalcRow[],
  calcKey: string,
  window: WindowKey
): SpreadStats | null {
  const label = WINDOW_CALC_LABEL[window];
  const found = rows.find((r) => r.Pair === calcKey && r.Window === label);
  if (!found) return null;
  return {
    pair: found.Pair,
    window: found.Window,
    correlation: found.Correlation,
    currentSpread: parseMoney(found['Current Spread']),
    meanSpread: parseMoney(found['Mean Spread']),
    stdDev: parseMoney(found['Std Dev']),
    zScore: found['Z-score'],
  };
}

export function useStockData() {
  const [data, setData] = useState<StockDataFile | null>(() => cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    load()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  const api = useMemo(
    () => ({
      ready: !!data,
      error,
      getSeries: (pair: PairKey, window: WindowKey): PairSeries | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        const a = data[meta.legA.dataset as StockDatasetKey];
        const b = data[meta.legB.dataset as StockDatasetKey];
        if (!a || !b) return null;
        return buildSeries(a, b, window);
      },
      getStats: (pair: PairKey, window: WindowKey): SpreadStats | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        return findCalc(data.calculated_data, meta.calcKey, window);
      },
      getLatestClose: (pair: PairKey): { a: number; b: number } | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        const a = data[meta.legA.dataset as StockDatasetKey];
        const b = data[meta.legB.dataset as StockDatasetKey];
        if (!a?.length || !b?.length) return null;
        const aLatest = takeWindow(normalize(a), 1)[0];
        const bLatest = takeWindow(normalize(b), 1)[0];
        return { a: aLatest.close, b: bLatest.close };
      },
    }),
    [data, error]
  );

  return api;
}
