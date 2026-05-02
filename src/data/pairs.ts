import type { PairKey, Sector, StockDatasetKey, WindowKey } from '../types';

export type PairMeta = {
  key: PairKey;
  legA: { name: string; ticker: string; dataset: StockDatasetKey };
  legB: { name: string; ticker: string; dataset: StockDatasetKey };
  sector: Sector;
  calcKey: string;
  correlation90: number;
};

export const PAIRS: Record<PairKey, PairMeta> = {
  V_MA: {
    key: 'V_MA',
    legA: { name: 'Visa', ticker: 'V', dataset: 'visa' },
    legB: { name: 'Mastercard', ticker: 'MA', dataset: 'mastercard' },
    sector: 'Finance',
    calcKey: 'V / MA',
    correlation90: 0.83,
  },
  KO_PEP: {
    key: 'KO_PEP',
    legA: { name: 'Coca-Cola', ticker: 'KO', dataset: 'coca_cola' },
    legB: { name: 'PepsiCo', ticker: 'PEP', dataset: 'pepsico' },
    sector: 'Consumer Goods',
    calcKey: 'KO / PEP',
    correlation90: 0.96,
  },
  F_GM: {
    key: 'F_GM',
    legA: { name: 'Ford', ticker: 'F', dataset: 'ford' },
    legB: { name: 'General Motors', ticker: 'GM', dataset: 'gm' },
    sector: 'Industrials',
    calcKey: 'F / GM',
    correlation90: 0.74,
  },
};

export const PAIR_ORDER: PairKey[] = ['KO_PEP', 'F_GM', 'V_MA'];

export const WINDOW_TRADING_DAYS: Record<WindowKey, number> = {
  '30d': 30,
  '90d': 90,
  '1y': 252,
};

export const WINDOW_LABEL: Record<WindowKey, string> = {
  '30d': '30 days',
  '90d': '90 days',
  '1y': '1 year',
};

export const WINDOW_CALC_LABEL: Record<WindowKey, string> = {
  '30d': '30-day',
  '90d': '90-day',
  '1y': '1-year',
};
