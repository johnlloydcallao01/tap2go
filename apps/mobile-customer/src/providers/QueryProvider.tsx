import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Match the shared web default (packages/client-services query/client):
      // fresh 3 min, kept 10 min — home screens override to 5 min where the
      // memory TTL is 5 min. Stops 60s background refetch churn on all
      // non-home screens (performance.md: cache TTL + staleTime match).
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 10,
      // Retry failed queries 1 time
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
