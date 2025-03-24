'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { setCurrentSession } from '@/lib/hasura/client';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-6">
            Для доступа к панели управления необходимо авторизоваться.
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Карточка управления постами */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-xl font-semibold">Управление постами</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Создавайте, редактируйте и публикуйте посты в вашем блоге.
            </p>
            <div className="flex space-x-3">
              <Link
                href="/dashboard/posts"
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
              >
                Все посты
              </Link>
              <Link
                href="/dashboard/posts/new"
                className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200"
              >
                Новый пост
              </Link>
            </div>
          </div>
        </div>

        {/* Карточка аналитики */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-600 text-white p-4">
            <h2 className="text-xl font-semibold">Аналитика</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Просматривайте статистику посещений и взаимодействия с вашим блогом.
            </p>
            <Link
              href="/dashboard/analytics"
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded hover:bg-purple-200"
            >
              Открыть аналитику
            </Link>
          </div>
        </div>

        {/* Карточка настроек профиля */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-700 text-white p-4">
            <h2 className="text-xl font-semibold">Настройки профиля</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Управляйте своим профилем, настройками блога и интеграциями.
            </p>
            <Link
              href="/dashboard/settings"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Настройки
            </Link>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Быстрая статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Опубликованных постов</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">0</div>
            <div className="text-gray-600">Черновиков</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Просмотров за неделю</div>
          </div>
        </div>
      </div>

      {/* Последние действия */}
      <div className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Последние действия</h2>
        <div className="border-t">
          <div className="py-3 border-b flex justify-between items-center">
            <div>
              <span className="text-gray-600">Вы вошли в систему</span>
            </div>
            <div className="text-sm text-gray-500">Сейчас</div>
          </div>
        </div>
      </div>
    </div>
  );
}
