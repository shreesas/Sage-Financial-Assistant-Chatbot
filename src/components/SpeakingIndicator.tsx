import bigSage from '../assets/big_sage_profile.svg';

type Props = { onStop: () => void };

const LEFT_BARS  = [14, 22, 34, 52, 38, 26, 16];
const RIGHT_BARS = [...LEFT_BARS].reverse();
const DURATIONS  = ['1.1s', '0.85s', '1.25s', '0.9s', '1.05s', '0.8s', '1.3s'];
const DELAYS     = ['0ms', '120ms', '240ms', '60ms', '180ms', '300ms', '150ms'];

function PauseIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="4" width="5" height="16" rx="2" fill="currentColor" />
      <rect x="14" y="4" width="5" height="16" rx="2" fill="currentColor" />
    </svg>
  );
}

function Bars({ heights }: { heights: number[] }) {
  return (
    <div className="speaking-ind__bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className="speaking-ind__bar"
          style={{
            height: `${h}px`,
            animationDuration: DURATIONS[i],
            animationDelay: DELAYS[i],
          }}
        />
      ))}
    </div>
  );
}

export default function SpeakingIndicator({ onStop }: Props) {
  return (
    <div className="speaking-ind">
      <Bars heights={LEFT_BARS} />
      <button
        className="speaking-ind__avatar"
        onClick={onStop}
        aria-label="Sage is speaking — click to stop"
        type="button"
      >
        <img src={bigSage} alt="" />
        <span className="speaking-ind__pause" aria-hidden>
          <PauseIcon />
        </span>
      </button>
      <Bars heights={RIGHT_BARS} />
    </div>
  );
}
