import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

// The reading tracker: books owned, chapters read, streak, stamps and "continue reading".
// Shared by the navbar badge, the Store, the Reader and the Profile page.
const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(() => {
    return api
      .get('/library/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return <StatsContext.Provider value={{ stats, refreshStats }}>{children}</StatsContext.Provider>;
}

export function useStats() {
  return useContext(StatsContext);
}
