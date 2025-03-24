'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Начало авторизации через:', provider);
      
      // Добавляем редирект на страницу авторизации GitHub
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false // Не делать автоматический редирект
      });
      
      console.log('Результат вызова signIn:', result);
      console.log('Тип результата:', typeof result);
      console.log('Ключи в результате:', result ? Object.keys(result) : 'нет ключей');
      console.log('Значение result.url:', result?.url);
      console.log('Значение result.error:', result?.error);
      
      if (result?.error) {
        console.error('Ошибка в результате signIn:', result.error);
        setError(`Ошибка авторизации: ${result.error}`);
        setIsLoading(false);
      } else if (result?.url) {
        console.log('Перенаправление на:', result.url);
        window.location.href = result.url;
      } else {
        console.log('Неожиданный результат signIn, нет URL для перенаправления');
        setError('Неожиданная ошибка при авторизации');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Ошибка при вызове signIn:', err);
      setError('Произошла ошибка при авторизации');
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
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-center text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : 'Войти через GitHub'}
          </button>
          
          <a 
            href="/api/auth/signin/github?callbackUrl=/dashboard"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Прямая ссылка на GitHub
          </a>
          
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
}
