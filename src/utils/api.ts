import type { PriceRow } from '../types';

const API_KEY = String(import.meta.env.VITE_FMP_API_KEY ?? '').trim();
// v3 is legacy-only; the stable API works for all plans
const BASE_URL = 'https://financialmodelingprep.com/stable';

type FMPEODEntry = { date: string; close: number };

function oneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchStockHistory(ticker: string): Promise<PriceRow[]> {
  if (!API_KEY) {
    throw new Error('Missing VITE_FMP_API_KEY — add it to .env');
  }
  const url =
    `${BASE_URL}/historical-price-eod/full` +
    `?symbol=${encodeURIComponent(ticker)}&from=${oneYearAgo()}&to=${today()}&apikey=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`FMP error: ${response.status}`);

  const data = await response.json() as FMPEODEntry[] | { 'Error Message': string };

  if (!Array.isArray(data)) {
    throw new Error((data as { 'Error Message': string })['Error Message'] ?? 'Unexpected FMP response');
  }
  if (data.length === 0) throw new Error(`No data returned for ${ticker}`);

  return data
    .filter((r) => Number.isFinite(r.close))
    .map((r) => ({ date: r.date, close: r.close }))
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest → newest
}

export async function fetchPairData(tickerA: string, tickerB: string) {
  const [legA_Data, legB_Data] = await Promise.all([
    fetchStockHistory(tickerA),
    fetchStockHistory(tickerB),
  ]);
  return { legA_Data, legB_Data };
}
