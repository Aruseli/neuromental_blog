'use client';

import { SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/lib/hasura/client';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProvider client={createApolloClient()}>
        {children}
      </ApolloProvider>
    </SessionProvider>
  );
}
