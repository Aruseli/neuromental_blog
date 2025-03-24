'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import PostEditor from '@/components/post-editor/PostEditor';
import type { PostData } from '@/types/post';

// GraphQL мутация для создания нового поста
const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!,
    $excerpt: String,
    $slug: String!,
    $cover_image: String,
    $status: String!,
    $layout_json: jsonb,
    $author_id: uuid!
  ) {
    insert_posts_one(
      object: {
        title: $title,
        excerpt: $excerpt,
        slug: $slug,
        cover_image: $cover_image,
        status: $status,
        layout_json: $layout_json,
        author_id: $author_id
      }
    ) {
      id
      title
      status
      created_at
    }
  }
`;

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Мутация для создания поста
  const [createPost] = useMutation(CREATE_POST);

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  // Инициализируем новый пост
  useEffect(() => {
    setPost({
      id: 'new',
      title: 'Новый пост',
      excerpt: '',
      slug: '',
      cover_image: '',
      status: 'draft',
      layout_json: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      post_blocks: []
    });
  }, []);

  // Функция для сохранения поста
  const handleSave = async (postData: PostData, isPublish = false) => {
    try {
      setIsSaving(true);
      setSaveMessage('Сохранение...');

      if (!session?.user?.id) {
        throw new Error('Пользователь не авторизован');
      }

      // Создаем новый пост
      const status = isPublish ? 'published' : 'draft';
      const slug = postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      const result = await createPost({
        variables: {
          title: postData.title,
          excerpt: postData.excerpt,
          slug,
          cover_image: postData.cover_image,
          status,
          layout_json: postData.layout_json,
          author_id: session.user.id
        }
      });

      if (result.data?.insert_posts_one?.id) {
        setSaveMessage('Пост создан!');
        
        // Перенаправляем на страницу редактирования созданного поста
        setTimeout(() => {
          router.push(`/dashboard/posts/${result.data.insert_posts_one.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      setSaveMessage('Ошибка при создании поста');
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PostEditor 
        post={post} 
        onSave={handleSave} 
        isSaving={isSaving} 
        saveMessage={saveMessage}
        isNew={true}
      />
    </div>
  );
}
