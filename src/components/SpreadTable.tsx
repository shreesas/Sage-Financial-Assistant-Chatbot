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

export default function SpreadTable({ pair, window }: Props) {
  const { ready, error, getStats, getLatestClose } = useStockData();

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
    return (
      <div className="widget">
        <div className="widget__title">No data</div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget__title">
        Spread snapshot · {WINDOW_LABEL[window]}
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
          title="How far apart the two stock prices are right now."
        >
          Current gap
        </div>
        <div className="kv__value">{fmt$(stats.currentSpread)}</div>

        <div
          className="kv__label"
          title={`The average gap over the ${WINDOW_LABEL[window]} window — what's "normal" for this pair.`}
        >
          Typical gap
        </div>
        <div className="kv__value">{fmt$(stats.meanSpread)}</div>
      </div>
    </div>
  );
}
