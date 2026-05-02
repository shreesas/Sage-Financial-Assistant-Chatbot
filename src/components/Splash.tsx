import introLogo from '../assets/intro_logo.svg';

type Props = {
  onDismiss: () => void;
};

export default function Splash({ onDismiss }: Props) {
  return (
    <div
      className="splash"
      role="button"
      tabIndex={0}
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
      aria-label="Open Sage"
    >
      <img src={introLogo} alt="Sage — Your Financial Assistant" />
    </div>
  );
}
