export type PairKey = 'V_MA' | 'KO_PEP' | 'F_GM';

export type WindowKey = '30d' | '90d' | '1y';

export type Sector =
  | 'Finance'
  | 'Consumer Goods'
  | 'Industrials'
  | 'Technology'
  | 'Energy'
  | 'Healthcare';

export type NotificationMethod = 'push' | 'email' | 'sms';

export type OptionChip = {
  id: string;
  label: string;
  primary?: boolean;
};

export type WidgetSlot =
  | { kind: 'pairs' }
  | { kind: 'spread'; pair: PairKey; window: WindowKey }
  | { kind: 'chart'; pair: PairKey; window: WindowKey }
  | { kind: 'news'; pair: PairKey }
  | {
      kind: 'alert';
      pair: PairKey;
      threshold: number;
      method: NotificationMethod;
      currentZ: number;
    };

export type Message = {
  id: string;
  speaker: 'sage' | 'user';
  text?: string;
  slots?: WidgetSlot[];
  options?: OptionChip[];
  optionsResolved?: string;
};

export type AlertConfig = {
  pair: PairKey;
  threshold: number;
  method: NotificationMethod;
};

export type PriceRow = {
  date: string;
  close: number;
};

export type SpreadStats = {
  pair: string;
  window: string;
  correlation: number;
  currentSpread: number;
  meanSpread: number;
  stdDev: number;
  zScore: number;
};

export type StockDatasetKey =
  | 'visa'
  | 'mastercard'
  | 'coca_cola'
  | 'pepsico'
  | 'ford'
  | 'gm';

export type RawPriceRow = {
  Date: string;
  Open: string | number;
  High: number;
  Low: number;
  Close: number;
  'Adj Close': number;
  Volume: string | number;
};

export type RawCalcRow = {
  Pair: string;
  Window: string;
  Correlation: number;
  'Current Spread': string;
  'Mean Spread': string;
  'Std Dev': string;
  'Z-score': number;
};

export type StockDataFile = Record<StockDatasetKey, RawPriceRow[]> & {
  calculated_data: RawCalcRow[];
};
