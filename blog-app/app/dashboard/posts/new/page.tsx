'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { gql, useMutation } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import { PostEditor } from '@/components/post-editor/PostEditor';
import type { PostData } from '@/types/post';
import { v4 as uuidv4 } from 'uuid';

// GraphQL мутация для создания поста
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
    insert_posts_one(object: {
      title: $title,
      excerpt: $excerpt,
      slug: $slug,
      cover_image: $cover_image,
      status: $status,
      layout_json: $layout_json,
      author_id: $author_id
    }) {
      id
      title
      status
    }
  }
`;

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Создаем пустой пост
  const [post, setPost] = useState<PostData>({
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

  // Мутация для создания поста
  const [createPost] = useMutation(CREATE_POST);

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  // Функция для сохранения поста
  const handleSave = async (postData: PostData, isPublish = false) => {
    try {
      setIsSaving(true);
      setSaveMessage('Сохранение...');

      // Создаем новый пост
      const result = await createPost({
        variables: {
          title: postData.title,
          excerpt: postData.excerpt,
          slug: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-'),
          cover_image: postData.cover_image,
          status: isPublish ? 'published' : 'draft',
          layout_json: postData.layout_json,
          author_id: session?.user?.id
        }
      });

      // Получаем ID нового поста
      const newPostId = result.data.insert_posts_one.id;
      
      // Перенаправляем на страницу редактирования
      setSaveMessage('Пост создан!');
      setTimeout(() => {
        router.push(`/dashboard/posts/${newPostId}`);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      setSaveMessage('Ошибка при создании поста');
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return <div className="p-8 text-center">Для создания поста необходимо авторизоваться</div>;
  }

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