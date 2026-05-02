import bigSage from '../assets/big_sage_profile.svg';

interface Props {
  onSelectCategory: (id: string) => void;
}

const CATEGORIES = [
  { id: 'arbitrage', lines: ['Arbitrage', 'Watchlist'], enabled: true },
  { id: 'news', lines: ['Financial', 'News'], enabled: false },
  { id: 'paper-trading', lines: ['Paper', 'Trading'], enabled: false },
];

export default function EmptyState({ onSelectCategory }: Props) {
  return (
    <div className="empty">
      <div className="empty__avatar" aria-hidden="true">
        <img src={bigSage} alt="" />
      </div>
      <p className="empty__intro">
        Hi! I am <strong>Sage.</strong> I can help you find correlated stock pairs,
        check how a pair's spread is behaving, or set up alerts.
        What would you like to do?
      </p>
      <p className="empty__cats-label">Choose a category to start</p>
      <div className="empty__cats">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className="empty__cat-btn"
            disabled={!cat.enabled}
            onClick={() => cat.enabled && onSelectCategory(cat.id)}
          >
            {cat.lines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
