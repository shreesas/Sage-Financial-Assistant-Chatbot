import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PAIRS,
  WINDOW_CALC_LABEL,
  WINDOW_TRADING_DAYS,
} from '../data/pairs';
import { fetchStockHistory } from '../utils/api';
import type {
  PairKey,
  PriceRow,
  RawCalcRow,
  RawPriceRow,
  SpreadStats,
  StockDataFile,
  WindowKey,
} from '../types';

// ─── Static stock_data.json cache ────────────────────────────────────────────

let cache: StockDataFile | null = null;
let inflight: Promise<StockDataFile> | null = null;

function load(): Promise<StockDataFile> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
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

// ─── FMP per-ticker cache ─────────────────────────────────────────────────────

const avPriceCache = new Map<string, PriceRow[]>();
const avInflight = new Map<string, Promise<PriceRow[]>>();
const avErrorCache = new Map<string, string>(); // ticker → error message

function loadAvTicker(ticker: string): Promise<PriceRow[]> {
  const cached = avPriceCache.get(ticker);
  if (cached) return Promise.resolve(cached);
  const existing = avInflight.get(ticker);
  if (existing) return existing;
  const p = fetchStockHistory(ticker)
    .then((rows) => {
      avPriceCache.set(ticker, rows);
      avInflight.delete(ticker);
      return rows;
    })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      avErrorCache.set(ticker, msg);
      avInflight.delete(ticker);
      throw e;
    });
  avInflight.set(ticker, p);
  return p;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function parseMoney(s: string): number {
  return parseFloat(s.replace(/[$,]/g, ''));
}

function normalize(rows: RawPriceRow[]): PriceRow[] {
  const mapped = rows
    .map((r) => ({
      date: r.Date,
      close:
        typeof r.Close === 'number' ? r.Close : parseFloat(String(r.Close)),
    }))
    .filter((r) => Number.isFinite(r.close));
  return mapped.slice().reverse();
}

function takeWindow(series: PriceRow[], n: number): PriceRow[] {
  if (series.length <= n) return series;
  return series.slice(series.length - n);
}

/**
 * Wilder's smoothed RSI on an arbitrary value series.
 * Returns a parallel array; the first `period` entries are NaN.
 */
function computeRSI(values: number[], period = 14): number[] {
  const rsi = new Array<number>(values.length).fill(NaN);
  if (values.length < period + 1) return rsi;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsi;
}

function pearsonCorrelation(legA: PriceRow[], legB: PriceRow[]): number {
  const bByDate = new Map(legB.map((r) => [r.date, r.close]));
  const pairs: { a: number; b: number }[] = [];
  for (const ra of legA) {
    const rb = bByDate.get(ra.date);
    if (rb != null) pairs.push({ a: ra.close, b: rb });
  }
  const n = pairs.length;
  if (n < 2) return 0;
  const meanA = pairs.reduce((s, p) => s + p.a, 0) / n;
  const meanB = pairs.reduce((s, p) => s + p.b, 0) / n;
  let num = 0, denomA = 0, denomB = 0;
  for (const p of pairs) {
    const da = p.a - meanA;
    const db = p.b - meanB;
    num += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  const denom = Math.sqrt(denomA * denomB);
  return denom > 0 ? num / denom : 0;
}

// ─── Series / stats builders ─────────────────────────────────────────────────

export type PairSeries = {
  legA: PriceRow[];
  legB: PriceRow[];
  spread: { date: string; value: number }[];
};

function buildSeries(
  legARows: RawPriceRow[],
  legBRows: RawPriceRow[],
  window: WindowKey
): PairSeries {
  return buildSeriesFromPriceRows(normalize(legARows), normalize(legBRows), window);
}

function buildSeriesFromPriceRows(
  legA: PriceRow[],
  legB: PriceRow[],
  window: WindowKey
): PairSeries {
  const days = WINDOW_TRADING_DAYS[window];
  const bByDate = new Map(legB.map((r) => [r.date, r.close]));

  // Align dates across the full history
  type AlignedRow = { date: string; aClose: number; bClose: number };
  const full: AlignedRow[] = [];
  for (const ra of legA) {
    const bClose = bByDate.get(ra.date);
    if (bClose != null) full.push({ date: ra.date, aClose: ra.close, bClose });
  }

  // Step 1: price ratio spread (A / B) across full history
  const ratios = full.map((r) => r.aClose / r.bClose);

  // Step 2: RSI(14) on the ratio spread — computed over full history so the
  //         windowed slice always has valid (non-NaN) RSI values
  const rsiValues = computeRSI(ratios);

  // Step 3: keep only rows with a valid RSI, then take the window
  const withRSI = full
    .map((r, i) => ({ ...r, spreadRSI: rsiValues[i] }))
    .filter((r) => Number.isFinite(r.spreadRSI));

  // RSI fallback: if too few rows for warmup, use raw price ratio as spread
  if (withRSI.length < 2) {
    const windowed = full.slice(Math.max(0, full.length - days));
    return {
      legA: windowed.map((r) => ({ date: r.date, close: r.aClose })),
      legB: windowed.map((r) => ({ date: r.date, close: r.bClose })),
      spread: windowed.map((r) => ({ date: r.date, value: r.aClose / r.bClose })),
    };
  }

  const windowed = withRSI.slice(Math.max(0, withRSI.length - days));

  return {
    legA: windowed.map((r) => ({ date: r.date, close: r.aClose })),
    legB: windowed.map((r) => ({ date: r.date, close: r.bClose })),
    // Spread value = RSI of the price-ratio — used for chart and all stats
    spread: windowed.map((r) => ({ date: r.date, value: r.spreadRSI })),
  };
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

function computeSpreadStats(
  pair: PairKey,
  window: WindowKey,
  series: PairSeries,
  fullLegA: PriceRow[],
  fullLegB: PriceRow[]
): SpreadStats {
  // spread.value = RSI of the A/B price ratio for the windowed period
  const values = series.spread.map((s) => s.value);
  const n = values.length;
  if (n === 0) {
    return {
      pair: PAIRS[pair].calcKey,
      window: WINDOW_CALC_LABEL[window],
      correlation: 0,
      currentSpread: 0,
      meanSpread: 0,
      stdDev: 0,
      zScore: 0,
    };
  }
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const currentSpread = values[n - 1];
  const zScore = stdDev > 0 ? (currentSpread - mean) / stdDev : 0;
  // Correlation on raw close prices (Pearson over full aligned history)
  const correlation = pearsonCorrelation(fullLegA, fullLegB);
  return {
    pair: PAIRS[pair].calcKey,
    window: WINDOW_CALC_LABEL[window],
    correlation,
    currentSpread,
    meanSpread: mean,
    stdDev,
    zScore,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStockData() {
  const [data, setData] = useState<StockDataFile | null>(() => cache);
  const [error, setError] = useState<string | null>(null);
  // avTick increments when a fetch completes (triggers re-read of avPriceCache)
  const [avTick, setAvTick] = useState(0);
  // loadingTickers drives isLoadingPair — updated when fetches start AND finish
  const [loadingTickers, setLoadingTickers] = useState<ReadonlySet<string>>(new Set());

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

  const fetchForPair = useCallback(
    (pair: PairKey) => {
      const meta = PAIRS[pair];
      // Skip only if FMP data is already cached for both tickers
      if (avPriceCache.has(meta.legA.ticker) && avPriceCache.has(meta.legB.ticker)) return;

      // Collect promises for both legs: start a new fetch if idle, or attach
      // to an existing in-flight promise. This ensures every caller component
      // gets its own setAvTick callback — even when another component already
      // started the fetch and put the tickers into avInflight first.
      const newTickers: string[] = [];
      const promises: Promise<PriceRow[]>[] = [];

      for (const ticker of [meta.legA.ticker, meta.legB.ticker]) {
        if (avPriceCache.has(ticker)) continue;
        const inflight = avInflight.get(ticker);
        if (inflight) {
          promises.push(inflight); // attach to existing promise
        } else {
          newTickers.push(ticker);
          promises.push(loadAvTicker(ticker));
        }
      }

      if (promises.length === 0) return;

      if (newTickers.length > 0) {
        setLoadingTickers((prev) => new Set([...prev, ...newTickers]));
      }

      Promise.all(promises)
        .then(() => {
          setLoadingTickers((prev) => {
            const next = new Set(prev);
            newTickers.forEach((t) => next.delete(t));
            return next;
          });
          setAvTick((n) => n + 1);
        })
        .catch(() => {
          setLoadingTickers((prev) => {
            const next = new Set(prev);
            newTickers.forEach((t) => next.delete(t));
            return next;
          });
          setAvTick((n) => n + 1);
        });
    },
    [data]
  );

  const api = useMemo(
    () => ({
      ready: !!data,
      error,
      fetchForPair,
      isLoadingPair: (pair: PairKey): boolean => {
        const meta = PAIRS[pair];
        return (
          loadingTickers.has(meta.legA.ticker) ||
          loadingTickers.has(meta.legB.ticker)
        );
      },
      getAvError: (pair: PairKey): string | null => {
        const meta = PAIRS[pair];
        return (
          avErrorCache.get(meta.legA.ticker) ??
          avErrorCache.get(meta.legB.ticker) ??
          null
        );
      },
      getSeries: (pair: PairKey, window: WindowKey): PairSeries | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        // Prefer FMP live data — full 252-day history guarantees valid RSI for all windows
        const avA = avPriceCache.get(meta.legA.ticker);
        const avB = avPriceCache.get(meta.legB.ticker);
        if (avA && avB) return buildSeriesFromPriceRows(avA, avB, window);
        // Fall back to static price arrays while FMP is still loading
        const a = data[meta.legA.dataset];
        const b = data[meta.legB.dataset];
        if (a && b) return buildSeries(a, b, window);
        return null;
      },
      getStats: (pair: PairKey, window: WindowKey): SpreadStats | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        const staticStats = findCalc(data.calculated_data, meta.calcKey, window);
        if (staticStats) return staticStats;
        const avA = avPriceCache.get(meta.legA.ticker);
        const avB = avPriceCache.get(meta.legB.ticker);
        if (avA && avB) {
          const series = buildSeriesFromPriceRows(avA, avB, window);
          return computeSpreadStats(pair, window, series, avA, avB);
        }
        return null;
      },
      getLatestClose: (pair: PairKey): { a: number; b: number } | null => {
        if (!data) return null;
        const meta = PAIRS[pair];
        const a = data[meta.legA.dataset];
        const b = data[meta.legB.dataset];
        if (a?.length && b?.length) {
          const aLatest = takeWindow(normalize(a), 1)[0];
          const bLatest = takeWindow(normalize(b), 1)[0];
          return { a: aLatest.close, b: bLatest.close };
        }
        const avA = avPriceCache.get(meta.legA.ticker);
        const avB = avPriceCache.get(meta.legB.ticker);
        if (avA?.length && avB?.length) {
          return { a: avA[avA.length - 1].close, b: avB[avB.length - 1].close };
        }
        return null;
      },
    }),
    [data, error, avTick, loadingTickers, fetchForPair]
  );

  return api;
}
