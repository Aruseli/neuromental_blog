'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'Произошла ошибка при авторизации';
  
  if (error === 'AccessDenied') {
    errorMessage = 'Доступ запрещен. У вас нет прав для доступа к этому ресурсу.';
  } else if (error === 'Verification') {
    errorMessage = 'Ошибка верификации. Не удалось подтвердить вашу личность.';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Ошибка при инициализации OAuth авторизации.';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Ошибка при обработке ответа от OAuth провайдера.';
  } else if (error === 'OAuthCreateAccount') {
    errorMessage = 'Не удалось создать учетную запись через OAuth.';
  } else if (error === 'EmailCreateAccount') {
    errorMessage = 'Не удалось создать учетную запись через Email.';
  } else if (error === 'Callback') {
    errorMessage = 'Ошибка при обработке callback запроса.';
  } else if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'Учетная запись уже связана с другим аккаунтом.';
  } else if (error === 'EmailSignin') {
    errorMessage = 'Ошибка при отправке письма для входа.';
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'Неверные учетные данные.';
  } else if (error === 'SessionRequired') {
    errorMessage = 'Для доступа к этой странице требуется авторизация.';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Ошибка авторизации
          </h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-center text-red-700">{errorMessage}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
