'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [authUrl, setAuthUrl] = useState('');
  
  useEffect(() => {
    // Получаем URL для авторизации
    setAuthUrl(`${window.location.origin}/api/auth/callback/github`);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Диагностика авторизации</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Статус сессии</h2>
        <p><strong>Статус:</strong> {status}</p>
        {session ? (
          <div className="mt-2">
            <p><strong>Пользователь:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto max-h-60">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="mt-2 text-red-500">Сессия отсутствует</p>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Настройки GitHub OAuth</h2>
        <p>Для правильной работы авторизации через GitHub, убедитесь что в настройках OAuth приложения указан следующий Callback URL:</p>
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <code>{authUrl}</code>
        </div>
        <p className="mt-2">Проверьте настройки в <a href="https://github.com/settings/developers" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">GitHub Developer Settings</a>.</p>
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Переменные окружения</h2>
        <p>Убедитесь, что в файле <code>.env.local</code> правильно настроены следующие переменные:</p>
        <ul className="list-disc list-inside mt-2">
          <li><code>NEXTAUTH_URL</code> - должен быть <code>http://localhost:3000</code></li>
          <li><code>GITHUB_ID</code> - ID вашего GitHub OAuth приложения</li>
          <li><code>GITHUB_SECRET</code> - секретный ключ вашего GitHub OAuth приложения</li>
          <li><code>NEXTAUTH_SECRET</code> - секретный ключ для шифрования сессий</li>
        </ul>
      </div>
      
      <div className="flex space-x-4">
        <a href="/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded">
          Вернуться на страницу входа
        </a>
        <a href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
          На главную
        </a>
      </div>
    </div>
  );
}
