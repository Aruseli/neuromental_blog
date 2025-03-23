'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import { gql } from '@apollo/client';
import { Providers } from '@/app/providers';

// Запрос для получения постов
const GET_POSTS = gql`
  query GetPosts {
    posts(limit: 10, order_by: { created_at: desc }) {
      id
      title
      slug
      excerpt
      created_at
      author {
        id
        name
      }
    }
  }
`;

// Мутация для создания поста
const CREATE_POST = gql`
  mutation CreatePost($title: String!, $slug: String!, $excerpt: String) {
    insert_posts_one(object: { title: $title, slug: $slug, excerpt: $excerpt }) {
      id
      title
      slug
    }
  }
`;

export default function TestHasuraPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Тестирование интеграции NextAuth с Hasura</h1>
      <AuthSection />
      <hr className="my-6" />
      <PostsSection />
    </div>
  );
}

function AuthSection() {
  const { data: session, status } = useSession();

  // Передаем сессию в Apollo Client при каждом изменении
  useEffect(() => {
    if (session) {
      console.log('Передаем сессию в Apollo Client');
      setCurrentSession(session);
    }
  }, [session]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Статус авторизации</h2>
      <div className="mb-4">
        <p>Статус: <span className="font-medium">{status}</span></p>
        {session ? (
          <div>
            <p>Пользователь: {session.user?.name}</p>
            <p>Email: {session.user?.email}</p>
            <p>ID: {session.user?.id}</p>
            <p>Роль: {session.user?.role}</p>
            <div className="mt-2">
              <h3 className="font-medium">JWT Claims:</h3>
              <pre className="bg-gray-200 p-2 mt-1 rounded text-sm overflow-auto max-h-40">
                {JSON.stringify(session.hasuraClaims, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>Пользователь не авторизован</p>
        )}
      </div>
      <div>
        {session ? (
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Выйти
          </button>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Войти через GitHub
          </button>
        )}
      </div>
    </div>
  );
}

function PostsSection() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');

  // Запрос на получение постов
  const { loading, error, data, refetch } = useQuery(GET_POSTS);

  // Мутация для создания поста
  const [createPost, { loading: createLoading, error: createError }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setTitle('');
      setSlug('');
      setExcerpt('');
      refetch();
    },
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    createPost({
      variables: {
        title,
        slug,
        excerpt,
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Тестирование GraphQL запросов</h2>

      {session && (
        <div className="mb-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Создать новый пост</h3>
          <form onSubmit={handleCreatePost}>
            <div className="mb-3">
              <label className="block mb-1">Заголовок:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Slug:</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Описание:</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              {createLoading ? 'Создание...' : 'Создать пост'}
            </button>
            {createError && (
              <div className="mt-2 text-red-500">
                Ошибка: {createError.message}
              </div>
            )}
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Список постов</h3>
        {loading ? (
          <p>Загрузка...</p>
        ) : error ? (
          <div className="text-red-500">
            <p>Ошибка при загрузке постов:</p>
            <pre className="bg-gray-100 p-2 mt-1 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            {data?.posts.length > 0 ? (
              <div className="grid gap-4">
                {data.posts.map((post: any) => (
                  <div key={post.id} className="border p-4 rounded">
                    <h4 className="font-bold">{post.title}</h4>
                    <p className="text-sm text-gray-600">Slug: {post.slug}</p>
                    {post.excerpt && <p className="mt-1">{post.excerpt}</p>}
                    <div className="mt-2 text-sm text-gray-500">
                      Автор: {post.author?.name || 'Неизвестно'} | 
                      Создан: {new Date(post.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Постов пока нет</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
