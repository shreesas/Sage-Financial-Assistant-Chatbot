import { PAIRS, PAIR_ORDER } from '../data/pairs';
import type { OptionChip, PairKey } from '../types';

type Props = {
  onPick?: (chip: OptionChip) => void;
  disabled?: boolean;
};

export default function PairsTable({ onPick, disabled }: Props) {
  const clickable = !!onPick && !disabled;
  return (
    <div className="pick-list" aria-label="Suggested correlated pairs">
      <div className="pick-list__header">Top correlated pairs · last 90 days</div>
      {PAIR_ORDER.map((key: PairKey) => {
        const meta = PAIRS[key];
        const chip: OptionChip = {
          id: `pair:${key}`,
          label: `${meta.legA.name} & ${meta.legB.name}`,
        };
        return (
          <button
            key={key}
            className={`pick-card${!clickable ? ' pick-card--disabled' : ''}`}
            onClick={clickable ? () => onPick!(chip) : undefined}
            disabled={!clickable}
            type="button"
          >
            <span className="pick-card__primary">
              {meta.legA.name} ({meta.legA.ticker}) · {meta.legB.name} ({meta.legB.ticker})
            </span>
            <span className="pick-card__secondary">{meta.sector}</span>
          </button>
        );
      })}
    </div>
  );
}
