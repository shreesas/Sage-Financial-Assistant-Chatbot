import { useEffect } from 'react';
import { PAIRS, WINDOW_LABEL } from '../data/pairs';
import { useStockData } from '../hooks/useStockData';
import type { PairKey, WindowKey } from '../types';

type Props = {
  pair: PairKey;
  window: WindowKey;
};

function fmt$(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtRSI(n: number): string {
  return n.toFixed(2);
}

export default function SpreadTable({ pair, window }: Props) {
  const { ready, error, getStats, getLatestClose, fetchForPair, isLoadingPair, getAvError } = useStockData();

  useEffect(() => {
    if (ready) fetchForPair(pair);
  }, [ready, pair, fetchForPair]);

  const meta = PAIRS[pair];

  if (error) {
    return (
      <div className="widget">
        <div className="widget__title">Couldn't load spread</div>
        <div className="verdict">{error}</div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="widget">
        <div className="widget__title">Loading spread…</div>
      </div>
    );
  }

  const stats = getStats(pair, window);
  const latest = getLatestClose(pair);

  if (!stats) {
    const avErr = getAvError(pair);
    return (
      <div className="widget">
        <div className="widget__title">
          {isLoadingPair(pair) ? 'Loading spread…' : avErr ? "Couldn't load spread" : 'NO DATA'}
        </div>
        {avErr && <div className="verdict" style={{ fontSize: 12, opacity: 0.7 }}>{avErr}</div>}
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget__title">
        Spread Snapshot · {WINDOW_LABEL[window]}
      </div>
      <table className="tbl" aria-label="Today's prices">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Company</th>
            <th className="num">Today's price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{meta.legA.ticker}</td>
            <td>{meta.legA.name}</td>
            <td className="num">{latest ? fmt$(latest.a) : '—'}</td>
          </tr>
          <tr>
            <td>{meta.legB.ticker}</td>
            <td>{meta.legB.name}</td>
            <td className="num">{latest ? fmt$(latest.b) : '—'}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ height: 14 }} />

      <div className="kv">
        <div
          className="kv__label"
          title="RSI of the A/B price ratio — measures overbought/oversold relative to historical spread."
        >
          Current Gap
        </div>
        <div className="kv__value">{fmtRSI(stats.currentSpread)}</div>

        <div
          className="kv__label"
          title={`The average RSI spread over the ${WINDOW_LABEL[window]} window — what's "normal" for this pair.`}
        >
          Typical Gap
        </div>
        <div className="kv__value">{fmtRSI(stats.meanSpread)}</div>
      </div>
    </div>
  );
}
