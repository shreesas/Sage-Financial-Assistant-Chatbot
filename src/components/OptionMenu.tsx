import type { OptionChip } from '../types';

type Props = {
  options: OptionChip[];
  resolved?: string;
  onSelect: (chip: OptionChip) => void;
};

export default function OptionMenu({ options, resolved, onSelect }: Props) {
  const isResolved = !!resolved;
  return (
    <div className="options" role="group" aria-label="Reply options">
      {options.map((opt) => {
        const selected = isResolved && resolved === opt.label;
        const cls = [
          'options__chip',
          opt.primary ? 'options__chip--primary' : '',
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
