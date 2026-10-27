import { createContext, useContext, useEffect, useState } from 'react';
import { recall, remember } from '../storage';

// Day / night mode. Starts from the device's own setting, then remembers the reader's choice.
const ThemeContext = createContext(null);

function startingTheme() {
  const saved = recall('theme', null);
  if (saved === 'day' || saved === 'night') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(startingTheme);

  // The whole stylesheet switches colours using <html data-theme="day|night">.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next = theme === 'day' ? 'night' : 'day';
    setTheme(next);
    remember('theme', next);
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
