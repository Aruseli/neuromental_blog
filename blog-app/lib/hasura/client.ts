import { ApolloClient, InMemoryCache, HttpLink, from, NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getSession, useSession } from 'next-auth/react';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Обработка ошибок Apollo
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL ошибка]: Сообщение: ${message}, Расположение: ${locations}, Путь: ${path}`
      )
    );
  if (networkError) console.error(`[Сетевая ошибка]: ${networkError}`);
});

// Глобальная переменная для хранения текущей сессии
let currentSession: any = null;

// Функция для установки текущей сессии
export const setCurrentSession = (session: any) => {
  currentSession = session;
  console.log('Сессия обновлена в Apollo Client:', session ? 'с токеном' : 'без токена');
};

// Создание HTTP линка с авторизацией
const createHttpLink = () => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
    credentials: 'include',
    fetch: async (uri, options) => {
      let session = currentSession;
      
      try {
        if (!session) {
          session = await getSession();
        }

        const headers = { ...options!.headers as Record<string, string> };
        
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }
        
        options!.headers = headers;
      } catch (error) {
        console.warn('Session handling error:', error);
      }
      
      return fetch(uri, options);
    },
  });
};

// Инициализация Apollo клиента
export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // Если страница с данными Apollo, восстанавливаем кеш
  if (initialState) {
    // Получаем существующий кеш
    const existingCache = _apolloClient.extract();
    
    // Восстанавливаем кеш с начальным состоянием
    _apolloClient.cache.restore({ ...(existingCache as any), ...(initialState as any) });
  }
  
  // Для SSR или SSG всегда создаем новый клиент
  if (typeof window === 'undefined') return _apolloClient;
  
  // Создаем клиент один раз для клиентской стороны
  if (!apolloClient) apolloClient = _apolloClient;
  
  return _apolloClient;
}

// Создание Apollo клиента
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, createHttpLink()]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}

// Хук для использования Apollo клиента
export function useApolloClient(initialState = null) {
  return initializeApollo(initialState);
}
