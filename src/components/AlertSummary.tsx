import { PAIRS } from '../data/pairs';
import type { NotificationMethod, PairKey } from '../types';

type Props = {
  pair: PairKey;
  threshold: number;
  method: NotificationMethod;
  currentZ: number;
};

const METHOD_LABEL: Record<NotificationMethod, string> = {
  push: 'Push notification',
  email: 'Email',
  sms: 'SMS',
};

export default function AlertSummary({
  pair,
  threshold,
  method,
  currentZ,
}: Props) {
  const meta = PAIRS[pair];
  const armed = Math.abs(currentZ) >= threshold;
  return (
    <div className="alert-card">
      <div className="alert-card__title">Alert active</div>
      <div className="alert-card__row">
        <span>Pair</span>
        <span>
          {meta.legA.name} ({meta.legA.ticker}) · {meta.legB.name} (
          {meta.legB.ticker})
        </span>
      </div>
      <div className="alert-card__row">
        <span>Threshold</span>
        <span>±{threshold} std dev</span>
      </div>
      <div className="alert-card__row">
        <span>Notify via</span>
        <span>{METHOD_LABEL[method]}</span>
      </div>
      <div className="alert-card__row">
        <span>Current z-score</span>
        <span>
          {currentZ.toFixed(2)} {armed ? '· at threshold' : '· armed'}
        </span>
      </div>
    </div>
  );
}
