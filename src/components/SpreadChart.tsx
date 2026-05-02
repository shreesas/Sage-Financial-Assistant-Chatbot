import { useEffect } from 'react';
import { PAIRS, WINDOW_LABEL } from '../data/pairs';
import { useStockData } from '../hooks/useStockData';
import type { PairKey, WindowKey } from '../types';

type Props = {
  pair: PairKey;
  window: WindowKey;
};

const W = 600;
const H = 180;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 22;

function buildPath(values: number[], min: number, max: number): string {
  if (!values.length || max === min) return '';
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  return values
    .map((v, i) => {
      const x = PAD_L + (i / (values.length - 1 || 1)) * innerW;
      const y = PAD_T + (1 - (v - min) / (max - min)) * innerH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function yTicks(min: number, max: number, n = 4): number[] {
  if (max === min) return [min];
  const step = (max - min) / n;
  const out: number[] = [];
  for (let i = 0; i <= n; i += 1) out.push(min + step * i);
  return out;
}

function fmtRSI(n: number): string {
  return n.toFixed(1);
}

function fmtDateShort(s: string): string {
  // "Apr 27, 2026" -> "Apr 27"
  return s.replace(/,\s*\d{4}\s*$/, '');
}

export default function SpreadChart({ pair, window }: Props) {
  const { ready, error, getSeries, getStats, fetchForPair, isLoadingPair, getAvError } = useStockData();
  const meta = PAIRS[pair];

  useEffect(() => {
    if (ready) fetchForPair(pair);
  }, [ready, pair, fetchForPair]);

  if (error) {
    return (
      <div className="chart">
        <div className="chart__head">
          <div className="chart__title">Couldn't load chart</div>
        </div>
        <div className="verdict">{error}</div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="chart">
        <div className="chart__head">
          <div className="chart__title">Loading chart…</div>
        </div>
      </div>
    );
  }

  const series = getSeries(pair, window);
  const stats = getStats(pair, window);
  if (!series || series.legA.length < 2) {
    const avErr = getAvError(pair);
    return (
      <div className="chart">
        <div className="chart__head">
          <div className="chart__title">
            {isLoadingPair(pair) ? 'Loading chart…' : avErr ? "Couldn't load chart" : 'No data for this window'}
          </div>
        </div>
        {avErr && <div className="verdict" style={{ fontSize: 12, opacity: 0.7 }}>{avErr}</div>}
      </div>
    );
  }

  const spread = series.spread.map((p) => p.value);

  const spreadMin = Math.min(...spread);
  const spreadMax = Math.max(...spread);
  const meanSpread = stats?.meanSpread ?? spread.reduce((a, b) => a + b, 0) / spread.length;
  const stdDev = stats?.stdDev ?? 0;
  const bandMin = meanSpread - stdDev;
  const bandMax = meanSpread + stdDev;
  const yMin = Math.min(spreadMin, bandMin);
  const yMax = Math.max(spreadMax, bandMax);
  const spreadPath = buildPath(spread, yMin, yMax);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const meanY =
    yMax === yMin
      ? PAD_T + innerH / 2
      : PAD_T + (1 - (meanSpread - yMin) / (yMax - yMin)) * innerH;
  const bandTopY =
    yMax === yMin
      ? meanY
      : PAD_T + (1 - (bandMax - yMin) / (yMax - yMin)) * innerH;
  const bandBottomY =
    yMax === yMin
      ? meanY
      : PAD_T + (1 - (bandMin - yMin) / (yMax - yMin)) * innerH;

  const ticksBottom = yTicks(yMin, yMax, 3);

  const firstDate = series.legA[0].date;
  const lastDate = series.legA[series.legA.length - 1].date;

  return (
    <div className="chart" aria-label="Spread chart">
      <div className="chart__head">
        <div
          className="chart__title"
          title={`RSI of the ${meta.legA.ticker}/${meta.legB.ticker} price ratio. Shaded band = ±1 standard deviation from the mean RSI.`}
        >
          Gap · {WINDOW_LABEL[window]}
        </div>
        <div className="chart__legend">
          <span title="One standard deviation either side of the average gap.">
            <span
              className="chart__legend-dot"
              style={{ background: 'var(--color-green-edge)' }}
            />
            typical wiggle band
          </span>
          <span title="Average gap over the selected window.">
            <span
              className="chart__legend-dot"
              style={{ background: 'var(--heather-3)' }}
            />
            typical gap
          </span>
        </div>
      </div>

      <div className="chart__panel">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Spread line">
          <rect
            x={PAD_L}
            y={Math.min(bandTopY, bandBottomY)}
            width={innerW}
            height={Math.abs(bandBottomY - bandTopY)}
            fill="var(--color-green-soft)"
          />
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={meanY}
            y2={meanY}
            stroke="var(--heather-3)"
            strokeDasharray="3 4"
          />
          {ticksBottom.map((t, i) => (
            <text
              key={i}
              x={PAD_L - 6}
              y={
                yMax === yMin
                  ? PAD_T + innerH / 2
                  : PAD_T + (1 - (t - yMin) / (yMax - yMin)) * innerH + 3
              }
              fontSize={10}
              fill="var(--text-faint)"
              textAnchor="end"
            >
              {fmtRSI(t)}
            </text>
          ))}
          <path
            d={spreadPath}
            fill="none"
            stroke="var(--color-green-accent)"
            strokeWidth={1.8}
          />
          <text x={PAD_L} y={H - 6} fontSize={10} fill="var(--text-faint)">
            {fmtDateShort(firstDate)}
          </text>
          <text
            x={W - PAD_R}
            y={H - 6}
            fontSize={10}
            fill="var(--text-faint)"
            textAnchor="end"
          >
            {fmtDateShort(lastDate)}
          </text>
        </svg>
      </div>
    </div>
  );
}
