'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { gql, useQuery } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// GraphQL запрос для получения списка постов
const GET_POSTS = gql`
  query GetPosts($author_id: uuid!) {
    posts(
      where: { author_id: { _eq: $author_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      status
      created_at
      updated_at
      published_at
      scheduled_at
    }
  }
`;

export default function PostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  // Запрос на получение списка постов
  const { loading, error, data, refetch } = useQuery(GET_POSTS, {
    variables: { author_id: session?.user?.id },
    skip: !session?.user?.id,
  });

  // Обновляем список постов при получении данных
  useEffect(() => {
    if (data && data.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  // Функция для получения статуса поста в читаемом виде
  const getStatusText = (post: any) => {
    switch (post.status) {
      case 'published':
        return 'Опубликован';
      case 'scheduled':
        return `Запланирован на ${format(new Date(post.scheduled_at), 'dd MMMM yyyy HH:mm', { locale: ru })}`;
      case 'draft':
      default:
        return 'Черновик';
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои посты</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Создать пост
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Ошибка при загрузке постов: {error.message}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">У вас пока нет постов</p>
          <Link
            href="/dashboard/posts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Создать первый пост
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Название
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Статус
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Создан
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Обновлен
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {getStatusText(post)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Редактировать
                    </Link>
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-gray-600 hover:text-gray-900"
                      target="_blank"
                    >
                      Просмотр
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}