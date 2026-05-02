import { PAIRS, PAIR_ORDER } from '../data/pairs';
import type { OptionChip, PairKey } from '../types';

type Props = {
  onPick?: (chip: OptionChip) => void;
  disabled?: boolean;
};

export default function PairsTable({ onPick, disabled }: Props) {
  return (
    <div className="widget">
      <div className="widget__title">Top correlated pairs · last 90 days</div>
      <table className="tbl" aria-label="Suggested correlated pairs">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Sector</th>
          </tr>
        </thead>
        <tbody>
          {PAIR_ORDER.map((key: PairKey) => {
            const meta = PAIRS[key];
            const chip: OptionChip = {
              id: `pair:${key}`,
              label: `${meta.legA.name} & ${meta.legB.name}`,
            };
            return (
              <tr
                key={key}
                className={
                  onPick && !disabled ? 'tbl__row--clickable' : undefined
                }
                onClick={
                  onPick && !disabled ? () => onPick(chip) : undefined
                }
              >
                <td>
                  <div className="tbl__pair">
                    {meta.legA.name} ({meta.legA.ticker}) ·{' '}
                    {meta.legB.name} ({meta.legB.ticker})
                  </div>
                </td>
                <td className="tbl__sector">{meta.sector}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
