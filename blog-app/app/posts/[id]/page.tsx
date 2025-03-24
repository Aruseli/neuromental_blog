'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { PostData, PostBlock } from '@/types/post';

// GraphQL запрос для получения поста по ID
const GET_POST = gql`
  query GetPost($id: uuid!) {
    posts_by_pk(id: $id) {
      id
      title
      excerpt
      slug
      cover_image
      status
      layout_json
      created_at
      updated_at
      published_at
      author {
        id
        name
        image
      }
      post_blocks {
        id
        type
        content
        grid_id
        created_at
        updated_at
      }
    }
  }
`;

export default function PostPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostData | null>(null);

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  // Запрос на получение данных поста
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { id },
  });

  // Обновляем состояние поста при получении данных
  useEffect(() => {
    if (data && data.posts_by_pk) {
      setPost(data.posts_by_pk);
    }
  }, [data]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  // Функция для рендеринга блока контента
  const renderBlock = (block: PostBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content.text }}
          />
        );
      case 'image':
        return (
          <figure className="my-4">
            <img
              src={block.content.url}
              alt={block.content.alt || 'Изображение'}
              className="max-w-full h-auto rounded"
            />
            {block.content.caption && (
              <figcaption className="text-sm text-center p-2 text-gray-600">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );
      case 'video':
        return (
          <figure className="my-4">
            <div
              className="rounded overflow-hidden"
              dangerouslySetInnerHTML={{ __html: block.content.embedCode || '' }}
            />
            {block.content.caption && (
              <figcaption className="text-sm text-center p-2 text-gray-600">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic my-4">
            {block.content.text}
            {block.content.author && (
              <footer className="text-right mt-2 text-sm font-medium">
                — {block.content.author}
              </footer>
            )}
          </blockquote>
        );
      case 'code':
        return (
          <div className="my-4 bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700 text-gray-200">
              <span>{block.content.language}</span>
              <button
                onClick={() => navigator.clipboard.writeText(block.content.code)}
                className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
              >
                Копировать
              </button>
            </div>
            <pre className="p-4 text-gray-200 overflow-x-auto">
              <code>{block.content.code}</code>
            </pre>
          </div>
        );
      default:
        return <div>Неподдерживаемый тип блока: {block.type}</div>;
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-500">Ошибка: {error.message}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8 text-center">Пост не найден</div>;

  // Проверяем, доступен ли пост для просмотра
  const isPublished = post.status === 'published';
  const isScheduled = post.status === 'scheduled';
  const isAuthor = session?.user?.id === post.author?.id;

  if (!isPublished && !isAuthor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Пост недоступен</h1>
        <p className="text-gray-600 mb-6">
          Этот пост еще не опубликован или был удален.
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Сортируем блоки по их позиции в макете
  const sortedBlocks = [...post.post_blocks].sort((a, b) => {
    const posA = post.layout_json?.[a.grid_id]?.y || 0;
    const posB = post.layout_json?.[b.grid_id]?.y || 0;
    return posA - posB;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Предупреждение для автора, если пост не опубликован */}
      {!isPublished && isAuthor && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Этот пост {isScheduled ? 'запланирован' : 'не опубликован'} и виден только вам.
                {isScheduled && post.scheduled_at && (
                  <span> Будет опубликован {formatDate(post.scheduled_at)}.</span>
                )}
              </p>
              <div className="mt-2">
                <Link
                  href={`/dashboard/posts/${post.id}`}
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Редактировать пост →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Заголовок поста */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {/* Мета-информация */}
      <div className="flex items-center text-gray-600 mb-8">
        {post.author?.image && (
          <img
            src={post.author.image}
            alt={post.author.name || 'Автор'}
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <div>
          <div className="font-medium">{post.author?.name || 'Автор'}</div>
          <div className="text-sm">
            {post.published_at
              ? `Опубликовано ${formatDate(post.published_at)}`
              : `Создано ${formatDate(post.created_at)}`}
          </div>
        </div>
      </div>

      {/* Обложка поста */}
      {post.cover_image && (
        <div className="mb-8">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Аннотация */}
      {post.excerpt && (
        <div className="text-xl text-gray-600 mb-8 border-l-4 border-gray-300 pl-4 py-2 italic">
          {post.excerpt}
        </div>
      )}

      {/* Содержимое поста */}
      <div className="post-content space-y-8">
        {sortedBlocks.map((block) => (
          <div key={block.id || block.grid_id} className="mb-8">
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Кнопки действий для автора */}
      {isAuthor && (
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Link
              href={`/dashboard/posts/${post.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Редактировать
            </Link>
            <Link
              href="/dashboard/posts"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Все посты
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
