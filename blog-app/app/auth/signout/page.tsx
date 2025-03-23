'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Выход из системы
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Вы уверены, что хотите выйти?
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Выполняется выход...' : 'Выйти из системы'}
          </button>
          
          <Link href="/" className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Отмена
          </Link>
        </div>
      </div>
    </div>
  );
}
