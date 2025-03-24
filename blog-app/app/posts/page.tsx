'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { gql, useQuery } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// GraphQL запрос для получения опубликованных постов
const GET_PUBLISHED_POSTS = gql`
  query GetPublishedPosts {
    posts(
      where: { 
        status: { _eq: "published" },
        _or: [
          { published_at: { _is_null: false } },
          { 
            scheduled_at: { _is_null: false },
            scheduled_at: { _lte: "now()" }
          }
        ]
      }
      order_by: { published_at: desc }
    ) {
      id
      title
      excerpt
      slug
      cover_image
      published_at
      author {
        id
        name
        image
      }
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

  // Запрос на получение опубликованных постов
  const { loading, error, data } = useQuery(GET_PUBLISHED_POSTS);

  // Обновляем список постов при получении данных
  useEffect(() => {
    if (data && data.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Все посты</h1>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Ошибка при загрузке постов: {error.message}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Пока нет опубликованных постов</p>
          {session && (
            <Link
              href="/dashboard/posts/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Создать пост
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.cover_image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Нет изображения</span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-gray-800">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    {post.author?.image && (
                      <img
                        src={post.author.image}
                        alt={post.author.name || 'Автор'}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{post.author?.name || 'Автор'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
