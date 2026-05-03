import userProfile from '../assets/small_user_profile.svg';

type Props = { onStop: () => void; isSpeaking: boolean };

const LEFT_BARS  = [14, 22, 34, 52, 38, 26, 16];
const RIGHT_BARS = [...LEFT_BARS].reverse();
const DURATIONS  = ['1.1s', '0.85s', '1.25s', '0.9s', '1.05s', '0.8s', '1.3s'];
const DELAYS     = ['0ms', '120ms', '240ms', '60ms', '180ms', '300ms', '150ms'];

function StopIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden>
      <rect x="5.5" y="5.5" width="13" height="13" rx="2.5" fill="currentColor" />
    </svg>
  );
}

function Bars({ heights }: { heights: number[] }) {
  return (
    <div className="listening-ind__bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className="listening-ind__bar"
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

export default function ListeningIndicator({ onStop, isSpeaking }: Props) {
  return (
    <div className={`listening-ind${isSpeaking ? ' listening-ind--active' : ''}`}>
      <Bars heights={LEFT_BARS} />
      <button
        className="listening-ind__avatar"
        onClick={onStop}
        aria-label="Listening — click to stop"
        type="button"
      >
        <img src={userProfile} alt="" />
        <span className="listening-ind__stop" aria-hidden>
          <StopIcon />
        </span>
      </button>
      <Bars heights={RIGHT_BARS} />
    </div>
  );
}
