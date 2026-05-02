import { useTheme } from '../ThemeProvider';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.54A9 9 0 1 1 9 3a7 7 0 1 0 12 11.54Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextIsLight = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === 'light'}
      className={`theme-toggle ${theme === 'light' ? 'theme-toggle--light' : ''}`}
      onClick={toggleTheme}
      aria-label={nextIsLight ? 'Switch to light mode' : 'Switch to dark mode'}
      title={nextIsLight ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track" aria-hidden>
        <span className="theme-toggle__thumb">
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  );
}
