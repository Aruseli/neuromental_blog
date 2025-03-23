'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { setCurrentSession } from '@/lib/hasura/client';

// GraphQL запрос для получения опубликованных постов
const GET_PUBLISHED_POSTS = gql`
  query GetPublishedPosts {
    posts(where: {status: {_eq: "published"}}, order_by: {published_at: desc}) {
      id
      title
      excerpt
      slug
      cover_image
      published_at
      author {
        name
        image
      }
    }
  }
`;

export default function Home() {
  const { data: session, status } = useSession();
  const { loading, error, data } = useQuery(GET_PUBLISHED_POSTS);
  
  // Передаем сессию в Apollo Client при каждом изменении
  useEffect(() => {
    if (session) {
      console.log('Передаем сессию в Apollo Client на главной странице');
      setCurrentSession(session);
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Мой блог</h1>
          <p className="text-gray-600">Публикации о технологиях и разработке</p>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Главная
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                Личный кабинет
              </Link>
              <Link href="/dashboard/posts/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Новая публикация
              </Link>
              <Link href="/auth/signout" className="text-red-600 hover:text-red-800">
                Выйти
              </Link>
            </>
          ) : (
            <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Войти
            </Link>
          )}
        </nav>
      </header>

      <main>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Последние публикации</h2>
          
          {loading && <p className="text-center py-8">Загрузка публикаций...</p>}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
              Ошибка при загрузке публикаций: {error.message}
            </div>
          )}
          
          {data && data.posts && data.posts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded">
              <p className="text-gray-600">Публикаций пока нет</p>
              {session && (
                <Link href="/dashboard/posts/new" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Создать первую публикацию
                </Link>
              )}
            </div>
          )}
          
          {data && data.posts && data.posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.posts.map((post: any) => (
                <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {post.cover_image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.cover_image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {post.author?.image && (
                          <img 
                            src={post.author.image} 
                            alt={post.author.name} 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )}
                        <span className="text-sm text-gray-700">{post.author?.name || 'Автор'}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        Читать →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Мой блог. Все права защищены.</p>
      </footer>
    </div>
  );
}
