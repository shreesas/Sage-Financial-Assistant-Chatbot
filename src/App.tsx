import { useEffect, useState } from 'react';
import Splash from './components/Splash';
import Chat from './components/Chat';
import './App.css';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowSplash(false), 1900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="app">
      {showSplash ? (
        <Splash onDismiss={() => setShowSplash(false)} />
      ) : (
        <Chat />
      )}
    </div>
  );
}
