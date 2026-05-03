export type PairKey =
  | 'V_MA'
  | 'AAPL_MSFT'
  | 'NVDA_AMD'
  | 'CRM_ORCL'
  | 'INTC_QCOM'
  | 'IBM_ACN'
  | 'JPM_BAC'
  | 'GS_MS'
  | 'C_WFC'
  | 'AXP_COF'
  | 'SCHW_ICE'
  | 'JNJ_PFE'
  | 'LLY_NVO'
  | 'MRK_BMY'
  | 'UNH_CVS'
  | 'TMO_DHR'
  | 'AMZN_EBAY'
  | 'MCD_WEN'
  | 'HD_LOW'
  | 'NKE_LULU'
  | 'F_GM'
  | 'META_GOOGL'
  | 'DIS_WBD'
  | 'CMCSA_CHTR'
  | 'T_VZ'
  | 'NFLX_PARA'
  | 'CAT_DE'
  | 'LMT_NOC'
  | 'UNP_CSX'
  | 'BA_EADSY'
  | 'HON_GE'
  | 'KO_PEP'
  | 'WMT_TGT'
  | 'PG_CL'
  | 'COST_WMT'
  | 'KHC_CAG'
  | 'XOM_CVX'
  | 'SHEL_BP'
  | 'COP_EOG'
  | 'SLB_HAL'
  | 'VLO_PSX'
  | 'PLD_COLD'
  | 'SPG_KIM'
  | 'AMT_CCI'
  | 'AVB_EQR'
  | 'PSA_EXR'
  | 'NEE_SO'
  | 'DUK_D'
  | 'AEP_XEL'
  | 'ED_PEG'
  | 'SRE_NI'
  | 'DOW_DD'
  | 'FCX_SCCO'
  | 'NUE_STLD'
  | 'APD_LIN'
  | 'SHW_PPG';

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
  ttsText?: string;
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

/** JSON key in `stock_data.json` for a price series (only some pairs have live data today). */
export type StockDatasetKey = string;

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

export type StockDataFile = Record<string, RawPriceRow[]> & {
  calculated_data: RawCalcRow[];
};
