import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { EXCHANGE_SERVERS, Provider } from '../data/exchanges';
import { latencyProvider, LatencyUpdate } from './latencyProvider';

type LatencyData = {
  from: string;
  to: string;
  latency: number;
};

interface AppState {
  providers: Record<string, boolean>;
  selectedExchange: string | null;
  searchQ: string;
  highlightedPair: { from: string; to: string } | null;
  latencyData: LatencyData[];
  allUpdates: LatencyUpdate[];
}

interface AppActions {
  setProviders: Dispatch<SetStateAction<Record<string, boolean>>>;
  toggleProvider: (p: Provider) => void;
  setSelectedExchange: (id: string | null) => void;
  setSearchQ: (q: string) => void;
  setHighlightedPair: (pair: { from: string; to: string } | null) => void;
}

// *** 1. Context ***
export const AppContext = createContext<AppState & AppActions | undefined>(undefined);

// *** 2. Hook ***
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// *** 3. Provider ***
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [providers, setProviders] = useState<Record<string, boolean>>({
    AWS: true,
    GCP: true,
    Azure: true,
  });
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [highlightedPair, setHighlightedPair] = useState<{ from: string; to: string } | null>(null);
  const [latencyData, setLatencyData] = useState<LatencyData[]>([]);
  const [allUpdates, setAllUpdates] = useState<LatencyUpdate[]>([]);

  const toggleProvider = useCallback((p: Provider) => {
    setProviders((prev) => ({ ...prev, [p]: !prev[p] }));
  }, []);

  const updateLatencyData = useCallback(
    (updates: LatencyUpdate[]) => {
      setAllUpdates(updates);
      const newData = updates.map((update) => ({
        from: update.from,
        to: update.to,
        latency: update.ms,
      }));
      const filteredData = selectedExchange
        ? newData.filter((item) => item.from === selectedExchange || item.to === selectedExchange)
        : newData;
      setLatencyData(filteredData);
    },
    [selectedExchange]
  );

  useEffect(() => {
    latencyProvider.start();
    const unsubscribe = latencyProvider.subscribe(updateLatencyData);
    return () => {
      latencyProvider.stop();
      unsubscribe();
    };
  }, [updateLatencyData]);

  const value: AppState & AppActions = {
    providers,
    selectedExchange,
    searchQ,
    highlightedPair,
    latencyData,
    allUpdates,
    setProviders,
    toggleProvider,
    setSelectedExchange,
    setSearchQ,
    setHighlightedPair,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
