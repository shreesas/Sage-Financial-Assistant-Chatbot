import type { PairKey, Sector, StockDatasetKey, WindowKey } from '../types';

export type PairMeta = {
  key: PairKey;
  legA: { name: string; ticker: string; dataset: StockDatasetKey };
  legB: { name: string; ticker: string; dataset: StockDatasetKey };
  sector: Sector | string;
  calcKey: string;
  correlation90: number;
  description?: string;
};

export const PAIRS: Record<PairKey, PairMeta> = {
  V_MA: {
    key: 'V_MA',
    legA: { name: 'Visa', ticker: 'V', dataset: 'visa' },
    legB: { name: 'Mastercard', ticker: 'MA', dataset: 'mastercard' },
    sector: 'Finance',
    calcKey: 'V / MA',
    correlation90: 0.86,
    description:
      'Payment-network heavyweights with a long history of moving together.',
  },
  AAPL_MSFT: {
    key: 'AAPL_MSFT',
    legA: { name: 'Apple', ticker: 'AAPL', dataset: 'apple' },
    legB: { name: 'Microsoft', ticker: 'MSFT', dataset: 'microsoft' },
    sector: 'Information Technology',
    calcKey: 'AAPL / MSFT',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Both are mega-cap tech giants that drive major indexes and display high historical cointegration.',
  },
  NVDA_AMD: {
    key: 'NVDA_AMD',
    legA: { name: 'Nvidia', ticker: 'NVDA', dataset: 'nvidia' },
    legB: { name: 'Advanced Micro Devices', ticker: 'AMD', dataset: 'advanced_micro_devices' },
    sector: 'Information Technology',
    calcKey: 'NVDA / AMD',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Direct competitors in the semiconductor and GPU space whose spreads diverge based on supply-demand and supply chain news.',
  },
  CRM_ORCL: {
    key: 'CRM_ORCL',
    legA: { name: 'Salesforce', ticker: 'CRM', dataset: 'salesforce' },
    legB: { name: 'Oracle', ticker: 'ORCL', dataset: 'oracle' },
    sector: 'Information Technology',
    calcKey: 'CRM / ORCL',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Both are enterprise software and cloud computing providers with heavily correlated institutional buying patterns.',
  },
  INTC_QCOM: {
    key: 'INTC_QCOM',
    legA: { name: 'Intel', ticker: 'INTC', dataset: 'intel' },
    legB: { name: 'Qualcomm', ticker: 'QCOM', dataset: 'qualcomm' },
    sector: 'Information Technology',
    calcKey: 'INTC / QCOM',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Traditional technology components that move in tandem during broader market cycles in hardware.',
  },
  IBM_ACN: {
    key: 'IBM_ACN',
    legA: { name: 'IBM', ticker: 'IBM', dataset: 'ibm' },
    legB: { name: 'Accenture', ticker: 'ACN', dataset: 'accenture' },
    sector: 'Information Technology',
    calcKey: 'IBM / ACN',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Two established IT consulting and enterprise technology infrastructure providers.',
  },
  JPM_BAC: {
    key: 'JPM_BAC',
    legA: { name: 'JPMorgan Chase', ticker: 'JPM', dataset: 'jpmorgan_chase' },
    legB: { name: 'Bank of America', ticker: 'BAC', dataset: 'bank_of_america' },
    sector: 'Financials',
    calcKey: 'JPM / BAC',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Standard tier-one commercial and investment banking pair that reacts symmetrically to interest rate changes.',
  },
  GS_MS: {
    key: 'GS_MS',
    legA: { name: 'Goldman Sachs', ticker: 'GS', dataset: 'goldman_sachs' },
    legB: { name: 'Morgan Stanley', ticker: 'MS', dataset: 'morgan_stanley' },
    sector: 'Financials',
    calcKey: 'GS / MS',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Pure-play investment banking giants with highly correlated valuation multiples.',
  },
  C_WFC: {
    key: 'C_WFC',
    legA: { name: 'Citigroup', ticker: 'C', dataset: 'citigroup' },
    legB: { name: 'Wells Fargo', ticker: 'WFC', dataset: 'wells_fargo' },
    sector: 'Financials',
    calcKey: 'C / WFC',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Large banking institutions that often experience comparable regulatory and macroeconomic shocks.',
  },
  AXP_COF: {
    key: 'AXP_COF',
    legA: { name: 'American Express', ticker: 'AXP', dataset: 'american_express' },
    legB: { name: 'Capital One', ticker: 'COF', dataset: 'capital_one' },
    sector: 'Financials',
    calcKey: 'AXP / COF',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Consumer credit and payments companies with similar consumer debt and spending exposures.',
  },
  SCHW_ICE: {
    key: 'SCHW_ICE',
    legA: { name: 'Charles Schwab', ticker: 'SCHW', dataset: 'charles_schwab' },
    legB: { name: 'Intercontinental Exchange', ticker: 'ICE', dataset: 'intercontinental_exchange' },
    sector: 'Financials',
    calcKey: 'SCHW / ICE',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Brokerage and market infrastructure giants that co-vary with trading volumes.',
  },
  JNJ_PFE: {
    key: 'JNJ_PFE',
    legA: { name: 'Johnson & Johnson', ticker: 'JNJ', dataset: 'johnson_and_johnson' },
    legB: { name: 'Pfizer', ticker: 'PFE', dataset: 'pfizer' },
    sector: 'Health Care',
    calcKey: 'JNJ / PFE',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Large-cap, established pharmaceutical and medical consumer goods firms with similar defensive characteristics.',
  },
  LLY_NVO: {
    key: 'LLY_NVO',
    legA: { name: 'Eli Lilly', ticker: 'LLY', dataset: 'eli_lilly' },
    legB: { name: 'Novo Nordisk', ticker: 'NVO', dataset: 'novo_nordisk' },
    sector: 'Health Care',
    calcKey: 'LLY / NVO',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Competitors in high-demand diabetes and weight-loss drugs; their spreads widen or narrow based on trial and production announcements.',
  },
  MRK_BMY: {
    key: 'MRK_BMY',
    legA: { name: 'Merck & Co.', ticker: 'MRK', dataset: 'merck_and_co' },
    legB: { name: 'Bristol Myers Squibb', ticker: 'BMY', dataset: 'bristol_myers_squibb' },
    sector: 'Health Care',
    calcKey: 'MRK / BMY',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Major pharmaceutical companies with comparable oncology portfolios and R&D pipelines.',
  },
  UNH_CVS: {
    key: 'UNH_CVS',
    legA: { name: 'UnitedHealth Group', ticker: 'UNH', dataset: 'unitedhealth_group' },
    legB: { name: 'CVS Health', ticker: 'CVS', dataset: 'cvs_health' },
    sector: 'Health Care',
    calcKey: 'UNH / CVS',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Health insurance and managed care providers that track together with changes in healthcare legislation.',
  },
  TMO_DHR: {
    key: 'TMO_DHR',
    legA: { name: 'Thermo Fisher Scientific', ticker: 'TMO', dataset: 'thermo_fisher_scientific' },
    legB: { name: 'Danaher', ticker: 'DHR', dataset: 'danaher' },
    sector: 'Health Care',
    calcKey: 'TMO / DHR',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Tools and diagnostics companies that service similar biotechnology and life sciences clients.',
  },
  AMZN_EBAY: {
    key: 'AMZN_EBAY',
    legA: { name: 'Amazon', ticker: 'AMZN', dataset: 'amazon' },
    legB: { name: 'eBay', ticker: 'EBAY', dataset: 'ebay' },
    sector: 'Consumer Discretionary',
    calcKey: 'AMZN / EBAY',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'E-commerce peers that share exposure to consumer spending habits.',
  },
  MCD_WEN: {
    key: 'MCD_WEN',
    legA: { name: 'McDonald\'s', ticker: 'MCD', dataset: 'mcdonalds' },
    legB: { name: 'Wendy\'s', ticker: 'WEN', dataset: 'wendys' },
    sector: 'Consumer Discretionary',
    calcKey: 'MCD / WEN',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Fast-food restaurant chains whose input costs (food and labor) and consumer bases are highly comparable.',
  },
  HD_LOW: {
    key: 'HD_LOW',
    legA: { name: 'Home Depot', ticker: 'HD', dataset: 'home_depot' },
    legB: { name: 'Lowe\'s', ticker: 'LOW', dataset: 'lowes' },
    sector: 'Consumer Discretionary',
    calcKey: 'HD / LOW',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Direct competitors in home improvement retail that experience the same housing-market dynamics.',
  },
  NKE_LULU: {
    key: 'NKE_LULU',
    legA: { name: 'Nike', ticker: 'NKE', dataset: 'nike' },
    legB: { name: 'Lululemon', ticker: 'LULU', dataset: 'lululemon' },
    sector: 'Consumer Discretionary',
    calcKey: 'NKE / LULU',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Premium apparel and footwear companies that share similar retail and demographic trends.',
  },
  F_GM: {
    key: 'F_GM',
    legA: { name: 'Ford', ticker: 'F', dataset: 'ford' },
    legB: { name: 'General Motors', ticker: 'GM', dataset: 'general_motors' },
    sector: 'Consumer Discretionary',
    calcKey: 'F / GM',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Traditional automotive manufacturers with correlated supply chain and macroeconomic risks.',
  },
  META_GOOGL: {
    key: 'META_GOOGL',
    legA: { name: 'Meta Platforms', ticker: 'META', dataset: 'meta_platforms' },
    legB: { name: 'Alphabet', ticker: 'GOOGL', dataset: 'alphabet' },
    sector: 'Communication Services',
    calcKey: 'META / GOOGL',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Digital advertising giants with massive, correlated cash flows driven by ad-spend sentiment.',
  },
  DIS_WBD: {
    key: 'DIS_WBD',
    legA: { name: 'The Walt Disney Company', ticker: 'DIS', dataset: 'the_walt_disney_company' },
    legB: { name: 'Warner Bros. Discovery', ticker: 'WBD', dataset: 'warner_bros_discovery' },
    sector: 'Communication Services',
    calcKey: 'DIS / WBD',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Legacy media and entertainment companies dealing with the shift from linear TV to streaming.',
  },
  CMCSA_CHTR: {
    key: 'CMCSA_CHTR',
    legA: { name: 'Comcast', ticker: 'CMCSA', dataset: 'comcast' },
    legB: { name: 'Charter Communications', ticker: 'CHTR', dataset: 'charter_communications' },
    sector: 'Communication Services',
    calcKey: 'CMCSA / CHTR',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Telecom and cable providers that face identical broadband and media consumption pressures.',
  },
  T_VZ: {
    key: 'T_VZ',
    legA: { name: 'AT&T', ticker: 'T', dataset: 'atandt' },
    legB: { name: 'Verizon', ticker: 'VZ', dataset: 'verizon' },
    sector: 'Communication Services',
    calcKey: 'T / VZ',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Traditional telecom utilities with similar dividend yields and capital expenditures.',
  },
  NFLX_PARA: {
    key: 'NFLX_PARA',
    legA: { name: 'Netflix', ticker: 'NFLX', dataset: 'netflix' },
    legB: { name: 'Paramount Global', ticker: 'PARA', dataset: 'paramount_global' },
    sector: 'Communication Services',
    calcKey: 'NFLX / PARA',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Content and streaming-focused pairs, demonstrating distinct valuation convergence and divergence based on subscriber growth.',
  },
  CAT_DE: {
    key: 'CAT_DE',
    legA: { name: 'Caterpillar', ticker: 'CAT', dataset: 'caterpillar' },
    legB: { name: 'Deere & Company', ticker: 'DE', dataset: 'deere_and_company' },
    sector: 'Industrials',
    calcKey: 'CAT / DE',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Heavy equipment manufacturers whose international sales rely on large industrial and agricultural cycles.',
  },
  LMT_NOC: {
    key: 'LMT_NOC',
    legA: { name: 'Lockheed Martin', ticker: 'LMT', dataset: 'lockheed_martin' },
    legB: { name: 'Northrop Grumman', ticker: 'NOC', dataset: 'northrop_grumman' },
    sector: 'Industrials',
    calcKey: 'LMT / NOC',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Aerospace and defense contractors with highly similar defense budget and government contract exposures.',
  },
  UNP_CSX: {
    key: 'UNP_CSX',
    legA: { name: 'Union Pacific', ticker: 'UNP', dataset: 'union_pacific' },
    legB: { name: 'CSX', ticker: 'CSX', dataset: 'csx' },
    sector: 'Industrials',
    calcKey: 'UNP / CSX',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Class I railroad operators that react identically to supply chain volumes and freight pricing.',
  },
  BA_EADSY: {
    key: 'BA_EADSY',
    legA: { name: 'Boeing', ticker: 'BA', dataset: 'boeing' },
    legB: { name: 'Airbus', ticker: 'EADSY', dataset: 'airbus' },
    sector: 'Industrials',
    calcKey: 'BA / EADSY',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Duopoly airplane manufacturers whose stock prices react to global aviation trends.',
  },
  HON_GE: {
    key: 'HON_GE',
    legA: { name: 'Honeywell', ticker: 'HON', dataset: 'honeywell' },
    legB: { name: 'General Electric', ticker: 'GE', dataset: 'general_electric' },
    sector: 'Industrials',
    calcKey: 'HON / GE',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Multi-industrial manufacturing conglomerates with exposure to aerospace and energy end-markets.',
  },
  KO_PEP: {
    key: 'KO_PEP',
    legA: { name: 'The Coca-Cola Company', ticker: 'KO', dataset: 'coca_cola' },
    legB: { name: 'PepsiCo', ticker: 'PEP', dataset: 'pepsico' },
    sector: 'Consumer Staples',
    calcKey: 'KO / PEP',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Classic, highly correlated beverage and snack duopoly.',
  },
  WMT_TGT: {
    key: 'WMT_TGT',
    legA: { name: 'Walmart', ticker: 'WMT', dataset: 'walmart' },
    legB: { name: 'Target', ticker: 'TGT', dataset: 'target' },
    sector: 'Consumer Staples',
    calcKey: 'WMT / TGT',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Broadline retail chains that share similar consumer sentiment and supply chain dynamics.',
  },
  PG_CL: {
    key: 'PG_CL',
    legA: { name: 'The Procter & Gamble Company', ticker: 'PG', dataset: 'the_procter_and_gamble_company' },
    legB: { name: 'Colgate-Palmolive', ticker: 'CL', dataset: 'colgate_palmolive' },
    sector: 'Consumer Staples',
    calcKey: 'PG / CL',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Household and personal product giants with stable, defensive pricing power.',
  },
  COST_WMT: {
    key: 'COST_WMT',
    legA: { name: 'Costco', ticker: 'COST', dataset: 'costco' },
    legB: { name: 'Walmart', ticker: 'WMT', dataset: 'walmart' },
    sector: 'Consumer Staples',
    calcKey: 'COST / WMT',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Bulk retail and consumer goods giants with comparable margins and customer bases.',
  },
  KHC_CAG: {
    key: 'KHC_CAG',
    legA: { name: 'The Kraft Heinz Company', ticker: 'KHC', dataset: 'the_kraft_heinz_company' },
    legB: { name: 'Conagra Brands', ticker: 'CAG', dataset: 'conagra_brands' },
    sector: 'Consumer Staples',
    calcKey: 'KHC / CAG',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Packaged food companies that respond similarly to agricultural commodity prices.',
  },
  XOM_CVX: {
    key: 'XOM_CVX',
    legA: { name: 'Exxon Mobil', ticker: 'XOM', dataset: 'exxon_mobil' },
    legB: { name: 'Chevron', ticker: 'CVX', dataset: 'chevron' },
    sector: 'Energy',
    calcKey: 'XOM / CVX',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Supermajor integrated oil and gas companies whose prices move alongside global crude oil prices.',
  },
  SHEL_BP: {
    key: 'SHEL_BP',
    legA: { name: 'Shell', ticker: 'SHEL', dataset: 'shell' },
    legB: { name: 'BP', ticker: 'BP', dataset: 'bp' },
    sector: 'Energy',
    calcKey: 'SHEL / BP',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Global integrated oil and gas giants, both traded via American Depositary Receipts (ADRs) or cross-listings.',
  },
  COP_EOG: {
    key: 'COP_EOG',
    legA: { name: 'ConocoPhillips', ticker: 'COP', dataset: 'conocophillips' },
    legB: { name: 'EOG Resources', ticker: 'EOG', dataset: 'eog_resources' },
    sector: 'Energy',
    calcKey: 'COP / EOG',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'U.S.-focused exploration and production (E&P) companies.',
  },
  SLB_HAL: {
    key: 'SLB_HAL',
    legA: { name: 'Schlumberger', ticker: 'SLB', dataset: 'schlumberger' },
    legB: { name: 'Halliburton', ticker: 'HAL', dataset: 'halliburton' },
    sector: 'Energy',
    calcKey: 'SLB / HAL',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Oilfield services companies with heavy correlation to drilling and exploration activity.',
  },
  VLO_PSX: {
    key: 'VLO_PSX',
    legA: { name: 'Valero Energy', ticker: 'VLO', dataset: 'valero_energy' },
    legB: { name: 'Phillips 66', ticker: 'PSX', dataset: 'phillips_66' },
    sector: 'Energy',
    calcKey: 'VLO / PSX',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Independent petroleum refiners and marketers with correlated margins.',
  },
  PLD_COLD: {
    key: 'PLD_COLD',
    legA: { name: 'Prologis', ticker: 'PLD', dataset: 'prologis' },
    legB: { name: 'Americold Realty Trust', ticker: 'COLD', dataset: 'americold_realty_trust' },
    sector: 'Real Estate',
    calcKey: 'PLD / COLD',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Real estate investment trusts (REITs) specializing in logistics and temperature-controlled storage.',
  },
  SPG_KIM: {
    key: 'SPG_KIM',
    legA: { name: 'Simon Property Group', ticker: 'SPG', dataset: 'simon_property_group' },
    legB: { name: 'Kimco Realty', ticker: 'KIM', dataset: 'kimco_realty' },
    sector: 'Real Estate',
    calcKey: 'SPG / KIM',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Retail REITs whose performance correlates with mall traffic and physical store leasing.',
  },
  AMT_CCI: {
    key: 'AMT_CCI',
    legA: { name: 'American Tower', ticker: 'AMT', dataset: 'american_tower' },
    legB: { name: 'Crown Castle', ticker: 'CCI', dataset: 'crown_castle' },
    sector: 'Real Estate',
    calcKey: 'AMT / CCI',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Specialized telecom tower REITs that lease infrastructure to identical wireless carriers.',
  },
  AVB_EQR: {
    key: 'AVB_EQR',
    legA: { name: 'AvalonBay Communities', ticker: 'AVB', dataset: 'avalonbay_communities' },
    legB: { name: 'Equity Residential', ticker: 'EQR', dataset: 'equity_residential' },
    sector: 'Real Estate',
    calcKey: 'AVB / EQR',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Multi-family residential apartment REITs that reflect the same rental market conditions.',
  },
  PSA_EXR: {
    key: 'PSA_EXR',
    legA: { name: 'Public Storage', ticker: 'PSA', dataset: 'public_storage' },
    legB: { name: 'Extra Space Storage', ticker: 'EXR', dataset: 'extra_space_storage' },
    sector: 'Real Estate',
    calcKey: 'PSA / EXR',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Self-storage REITs that exhibit nearly identical seasonal and real estate cycles.',
  },
  NEE_SO: {
    key: 'NEE_SO',
    legA: { name: 'NextEra Energy', ticker: 'NEE', dataset: 'nextera_energy' },
    legB: { name: 'The Southern Company', ticker: 'SO', dataset: 'the_southern_company' },
    sector: 'Utilities',
    calcKey: 'NEE / SO',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Large regulated electric and renewable utility companies.',
  },
  DUK_D: {
    key: 'DUK_D',
    legA: { name: 'Duke Energy', ticker: 'DUK', dataset: 'duke_energy' },
    legB: { name: 'Dominion Energy', ticker: 'D', dataset: 'dominion_energy' },
    sector: 'Utilities',
    calcKey: 'DUK / D',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Major energy, gas, and electric utilities with comparable rate-base sizes.',
  },
  AEP_XEL: {
    key: 'AEP_XEL',
    legA: { name: 'American Electric Power', ticker: 'AEP', dataset: 'american_electric_power' },
    legB: { name: 'Xcel Energy', ticker: 'XEL', dataset: 'xcel_energy' },
    sector: 'Utilities',
    calcKey: 'AEP / XEL',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Regulated utility holding companies with similar geographic and yield profiles.',
  },
  ED_PEG: {
    key: 'ED_PEG',
    legA: { name: 'Consolidated Edison', ticker: 'ED', dataset: 'consolidated_edison' },
    legB: { name: 'Public Service Enterprise Group', ticker: 'PEG', dataset: 'public_service_enterprise_group' },
    sector: 'Utilities',
    calcKey: 'ED / PEG',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Utility companies serving major Northeastern metropolitan regions.',
  },
  SRE_NI: {
    key: 'SRE_NI',
    legA: { name: 'Sempra', ticker: 'SRE', dataset: 'sempra' },
    legB: { name: 'NiSource', ticker: 'NI', dataset: 'nisource' },
    sector: 'Utilities',
    calcKey: 'SRE / NI',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Energy infrastructure and gas-utility-focused organizations.',
  },
  DOW_DD: {
    key: 'DOW_DD',
    legA: { name: 'Dow Inc.', ticker: 'DOW', dataset: 'dow_inc' },
    legB: { name: 'DuPont de Nemours', ticker: 'DD', dataset: 'dupont_de_nemours' },
    sector: 'Materials',
    calcKey: 'DOW / DD',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Specialty and commodity chemical producers that spun off from their merger and share correlated input costs.',
  },
  FCX_SCCO: {
    key: 'FCX_SCCO',
    legA: { name: 'Freeport-McMoRan', ticker: 'FCX', dataset: 'freeport_mcmoran' },
    legB: { name: 'Southern Copper', ticker: 'SCCO', dataset: 'southern_copper' },
    sector: 'Materials',
    calcKey: 'FCX / SCCO',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Mining companies whose underlying equity prices correlate to global copper prices.',
  },
  NUE_STLD: {
    key: 'NUE_STLD',
    legA: { name: 'Nucor', ticker: 'NUE', dataset: 'nucor' },
    legB: { name: 'Steel Dynamics', ticker: 'STLD', dataset: 'steel_dynamics' },
    sector: 'Materials',
    calcKey: 'NUE / STLD',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Domestic steel producers that respond to the same industrial and construction demand.',
  },
  APD_LIN: {
    key: 'APD_LIN',
    legA: { name: 'Air Products and Chemicals', ticker: 'APD', dataset: 'air_products_and_chemicals' },
    legB: { name: 'Linde plc', ticker: 'LIN', dataset: 'linde_plc' },
    sector: 'Materials',
    calcKey: 'APD / LIN',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Industrial gas suppliers and manufacturers with long-term supply contracts.',
  },
  SHW_PPG: {
    key: 'SHW_PPG',
    legA: { name: 'Sherwin-Williams', ticker: 'SHW', dataset: 'sherwin_williams' },
    legB: { name: 'PPG Industries', ticker: 'PPG', dataset: 'ppg_industries' },
    sector: 'Materials',
    calcKey: 'SHW / PPG',
    correlation90: 0.80, // Note: Placeholder correlation value
    description: 'Paint and coating manufacturers with similar exposures to housing and automotive markets.',
  },
};

export const PAIR_ORDER: PairKey[] = [
  'V_MA',
  'AAPL_MSFT',
  'NVDA_AMD',
  'CRM_ORCL',
  'INTC_QCOM',
  'IBM_ACN',
  'JPM_BAC',
  'GS_MS',
  'C_WFC',
  'AXP_COF',
  'SCHW_ICE',
  'JNJ_PFE',
  'LLY_NVO',
  'MRK_BMY',
  'UNH_CVS',
  'TMO_DHR',
  'AMZN_EBAY',
  'MCD_WEN',
  'HD_LOW',
  'NKE_LULU',
  'F_GM',
  'META_GOOGL',
  'DIS_WBD',
  'CMCSA_CHTR',
  'T_VZ',
  'NFLX_PARA',
  'CAT_DE',
  'LMT_NOC',
  'UNP_CSX',
  'BA_EADSY',
  'HON_GE',
  'KO_PEP',
  'WMT_TGT',
  'PG_CL',
  'COST_WMT',
  'KHC_CAG',
  'XOM_CVX',
  'SHEL_BP',
  'COP_EOG',
  'SLB_HAL',
  'VLO_PSX',
  'PLD_COLD',
  'SPG_KIM',
  'AMT_CCI',
  'AVB_EQR',
  'PSA_EXR',
  'NEE_SO',
  'DUK_D',
  'AEP_XEL',
  'ED_PEG',
  'SRE_NI',
  'DOW_DD',
  'FCX_SCCO',
  'NUE_STLD',
  'APD_LIN',
  'SHW_PPG'
];

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