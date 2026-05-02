import { useFinnhubNews } from '../hooks/useFinnhubNews';
import type { NewsItem } from '../data/sageFlow';
import type { PairKey } from '../types';

type Props = {
  pair: PairKey;
};

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

function cardContent(n: NewsItem) {
  return (
    <>
      <div className="news__body">
        <div className="news__headline">{n.headline}</div>
        {n.summary && <div className="news__summary">{n.summary}</div>}
        <div className="news__source">
          {n.url && (
            <img
              className="news__favicon"
              src={`https://www.google.com/s2/favicons?domain=${getDomain(n.url)}&sz=16`}
              alt=""
              aria-hidden="true"
              width="16"
              height="16"
            />
          )}
          <span className="news__domain">{n.url ? getDomain(n.url) : n.source}</span>
        </div>
      </div>
    </>
  );
}

export default function NewsCards({ pair }: Props) {
  const { items, loading } = useFinnhubNews(pair);

  if (loading) {
    return (
      <div className="news" aria-label="Loading news" aria-busy="true">
        {[0, 1].map((i) => (
          <article key={i} className="news__card news__card--skeleton">
            <div className="news__body">
              <div className="news__headline news__headline--skeleton" />
              <div className="news__summary news__summary--skeleton" />
              <div className="news__source news__source--skeleton" />
            </div>
          </article>
        ))}
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
            {cardContent(n)}
          </a>
        ) : (
          <article key={i} className="news__card">
            {cardContent(n)}
          </article>
        )
      )}
    </div>
  );
}
