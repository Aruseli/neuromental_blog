'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function SignIn() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    setDebugInfo({ session, status });
  }, [session, status]);

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      // Remove redirect: false to allow standard OAuth flow
      await signIn(provider, {
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('SignIn exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Выберите способ авторизации
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : 'Войти через GitHub'}
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
  
  // Add this debug section
  {process.env.NODE_ENV === 'development' && (
    <pre className="mt-8 p-4 bg-gray-100 rounded">
      {JSON.stringify(debugInfo, null, 2)}
    </pre>
  )}
}
