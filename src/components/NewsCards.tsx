import { useFinnhubNews } from '../hooks/useFinnhubNews';
import type { PairKey } from '../types';

type Props = {
  pair: PairKey;
};

export default function NewsCards({ pair }: Props) {
  const { news, loading } = useFinnhubNews();
  const items = news[pair];

  if (loading) {
    return (
      <div className="news" aria-label="Loading news" aria-busy="true">
        <article className="news__card news__card--skeleton">
          <span className="news__ticker">&#8203;</span>
          <div className="news__headline news__headline--skeleton" />
          <div className="news__meta news__meta--skeleton" />
        </article>
        <article className="news__card news__card--skeleton">
          <span className="news__ticker">&#8203;</span>
          <div className="news__headline news__headline--skeleton" />
          <div className="news__meta news__meta--skeleton" />
        </article>
      </div>
    );
  }

  return (
    <div className="news" aria-label="Recent news">
      {items.map((n, i) =>
        n.url ? (
          <a
            key={i}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news__card news__card--link"
          >
            <span className="news__ticker">{n.ticker}</span>
            <div className="news__headline">{n.headline}</div>
            <div className="news__meta">
              {n.source} · {n.date}
            </div>
          </a>
        ) : (
          <article key={i} className="news__card">
            <span className="news__ticker">{n.ticker}</span>
            <div className="news__headline">{n.headline}</div>
            <div className="news__meta">
              {n.source} · {n.date}
            </div>
          </article>
        )
      )}
    </div>
  );
}
