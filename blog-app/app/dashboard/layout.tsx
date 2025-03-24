'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Проверяем, активна ли ссылка
  const isLinkActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Верхняя панель */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 text-gray-600 hover:text-gray-900 md:hidden"
            >
              ☰
            </button>
            <Link href="/" className="text-xl font-bold text-blue-600">
              Мой Блог
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user && (
              <div className="flex items-center">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'Аватар'}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <span className="text-gray-700 hidden md:inline">
                  {session.user.name}
                </span>
              </div>
            )}
            <Link
              href="/auth/signout"
              className="text-gray-600 hover:text-gray-900"
            >
              Выйти
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 flex flex-col md:flex-row">
        {/* Боковая панель */}
        <aside
          className={`w-full md:w-64 bg-white shadow-md md:shadow-none md:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } fixed md:relative z-10 top-16 md:top-0 left-0 h-screen md:h-auto overflow-y-auto`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className={`block px-4 py-2 rounded-md ${
                    isLinkActive('/dashboard') && !isLinkActive('/dashboard/posts') && !isLinkActive('/dashboard/analytics') && !isLinkActive('/dashboard/settings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Обзор
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/posts"
                  className={`block px-4 py-2 rounded-md ${
                    isLinkActive('/dashboard/posts')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Посты
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/analytics"
                  className={`block px-4 py-2 rounded-md ${
                    isLinkActive('/dashboard/analytics')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Аналитика
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className={`block px-4 py-2 rounded-md ${
                    isLinkActive('/dashboard/settings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Настройки
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 py-6 md:ml-4">{children}</main>
      </div>
    </div>
  );
}
