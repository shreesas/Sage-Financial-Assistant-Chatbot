import { PAIRS } from '../data/pairs';
import type { OptionChip, PairKey } from '../types';

const THRESHOLD_META: Record<string, { value: string; description: string }> = {
  'threshold:1.5': { value: '1.5', description: 'Earlier heads-up — triggers sooner, more alerts' },
  'threshold:2':   { value: '2',   description: 'Common choice — standard sensitivity' },
  'threshold:3':   { value: '3',   description: 'Major divergence only — fewer, stronger signals' },
  'threshold:custom': { value: 'Custom', description: 'Enter your own threshold number' },
};

type Props = {
  options: OptionChip[];
  resolved?: string;
  onSelect: (chip: OptionChip) => void;
};

function PairTable({ options, resolved, onSelect }: Props) {
  const isResolved = !!resolved;
  return (
    <div className="pick-list" aria-label="Select a pair">
      {options.map((opt) => {
        const key = opt.id.slice('pair:'.length) as PairKey;
        const meta = PAIRS[key];
        const selected = isResolved && resolved === opt.label;
        return (
          <button
            key={opt.id}
            type="button"
            className={`pick-card${selected ? ' pick-card--selected' : ''}${isResolved ? ' pick-card--disabled' : ''}`}
            onClick={() => !isResolved && onSelect(opt)}
            disabled={isResolved}
            aria-pressed={selected}
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

function ThresholdTable({ options, resolved, onSelect }: Props) {
  const isResolved = !!resolved;
  return (
    <div className="pick-list" aria-label="Select alert sensitivity">
      {options.map((opt) => {
        const meta = THRESHOLD_META[opt.id];
        const selected = isResolved && resolved === opt.label;
        return (
          <button
            key={opt.id}
            type="button"
            className={`pick-card${selected ? ' pick-card--selected' : ''}${isResolved ? ' pick-card--disabled' : ''}`}
            onClick={() => !isResolved && onSelect(opt)}
            disabled={isResolved}
            aria-pressed={selected}
          >
            <span className="pick-card__label">{meta?.value ?? opt.label}</span>
            <span className="pick-card__secondary" style={{ textAlign: 'left' }}>{meta?.description ?? ''}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function OptionMenu({ options, resolved, onSelect }: Props) {
  const isPairPick = options.length > 0 && options[0].id.startsWith('pair:');
  if (isPairPick) {
    return <PairTable options={options} resolved={resolved} onSelect={onSelect} />;
  }

  const isThresholdPick = options.length > 0 && options[0].id.startsWith('threshold:');
  if (isThresholdPick) {
    return <ThresholdTable options={options} resolved={resolved} onSelect={onSelect} />;
  }

  const isResolved = !!resolved;
  return (
    <div className="options" role="group" aria-label="Reply options">
      {options.map((opt) => {
        const selected = isResolved && resolved === opt.label;
        const cls = [
          'options__chip',
          selected ? 'options__chip--selected' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={opt.id}
            type="button"
            className={cls}
            disabled={isResolved}
            onClick={() => onSelect(opt)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
