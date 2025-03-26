'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { setCurrentSession } from '@/lib/hasura/client';
import { PostEditor } from '@/components/post-editor/PostEditor';
import type { PostData } from '@/types/post';

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
      scheduled_at
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

// GraphQL мутация для обновления поста
const UPDATE_POST = gql`
  mutation UpdatePost(
    $id: uuid!,
    $title: String!,
    $excerpt: String,
    $slug: String!,
    $cover_image: String,
    $status: String!,
    $layout_json: jsonb,
    $scheduled_at: timestamptz
  ) {
    update_posts_by_pk(
      pk_columns: { id: $id },
      _set: {
        title: $title,
        excerpt: $excerpt,
        slug: $slug,
        cover_image: $cover_image,
        status: $status,
        layout_json: $layout_json,
        scheduled_at: $scheduled_at,
        updated_at: "now()"
      }
    ) {
      id
      title
      status
      updated_at
    }
  }
`;

// GraphQL мутация для создания блока контента
const CREATE_BLOCK = gql`
  mutation CreateBlock(
    $post_id: uuid!,
    $type: String!,
    $content: jsonb!,
    $grid_id: String!
  ) {
    insert_post_blocks_one(
      object: {
        post_id: $post_id,
        type: $type,
        content: $content,
        grid_id: $grid_id
      }
    ) {
      id
      type
      grid_id
    }
  }
`;

// GraphQL мутация для обновления блока контента
const UPDATE_BLOCK = gql`
  mutation UpdateBlock(
    $id: uuid!,
    $content: jsonb!,
    $grid_id: String!
  ) {
    update_post_blocks_by_pk(
      pk_columns: { id: $id },
      _set: {
        content: $content,
        grid_id: $grid_id,
        updated_at: "now()"
      }
    ) {
      id
      updated_at
    }
  }
`;

// GraphQL мутация для удаления блока контента
const DELETE_BLOCK = gql`
  mutation DeleteBlock($id: uuid!) {
    delete_post_blocks_by_pk(id: $id) {
      id
    }
  }
`;

export default function PostEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Запрос на получение данных поста
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { id },
    skip: id === 'new' || !id,
  });

  // Мутации для работы с постом и блоками
  const [updatePost] = useMutation(UPDATE_POST);
  const [createBlock] = useMutation(CREATE_BLOCK);
  const [updateBlock] = useMutation(UPDATE_BLOCK);
  const [deleteBlock] = useMutation(DELETE_BLOCK);

  // Передаем сессию в Apollo Client
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  // Обновляем состояние поста при получении данных
  useEffect(() => {
    if (data && data.posts_by_pk) {
      setPost(data.posts_by_pk);
    } else if (id === 'new') {
      // Создаем новый пост
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
    }
  }, [data, id]);

  // Функция для сохранения поста
  const handleSave = async (postData: PostData, isPublish = false) => {
    try {
      setIsSaving(true);
      setSaveMessage('Сохранение...');

      // Если это новый пост, сначала создаем его
      if (postData.id === 'new') {
        // Логика создания нового поста будет добавлена позже
        return;
      }

      // Обновляем пост
      const status = isPublish ? 'published' : postData.status;
      const published_at = isPublish && status === 'published' 
        ? new Date().toISOString() 
        : postData.published_at;

      await updatePost({
        variables: {
          id: postData.id,
          title: postData.title,
          excerpt: postData.excerpt,
          slug: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-'),
          cover_image: postData.cover_image,
          status,
          layout_json: postData.layout_json,
          scheduled_at: postData.scheduled_at
        }
      });

      // Обрабатываем блоки контента
      // Создаем новые блоки
      const newBlocks = postData.post_blocks.filter(block => !block.id || block.id.startsWith('temp_'));
      for (const block of newBlocks) {
        await createBlock({
          variables: {
            post_id: postData.id,
            type: block.type,
            content: block.content,
            grid_id: block.grid_id
          }
        });
      }

      // Обновляем существующие блоки
      const existingBlocks = postData.post_blocks.filter(block => block.id && !block.id.startsWith('temp_') && !block._deleted);
      for (const block of existingBlocks) {
        await updateBlock({
          variables: {
            id: block.id,
            content: block.content,
            grid_id: block.grid_id
          }
        });
      }

      // Удаляем помеченные на удаление блоки
      const deletedBlocks = postData.post_blocks.filter(block => block._deleted);
      for (const block of deletedBlocks) {
        if (block.id && !block.id.startsWith('temp_')) {
          await deleteBlock({
            variables: {
              id: block.id
            }
          });
        }
      }

      setSaveMessage(isPublish ? 'Опубликовано!' : 'Сохранено!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setSaveMessage('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка: {error.message}</div>;
  if (!post) return <div className="p-8 text-center">Пост не найден</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PostEditor 
        post={post} 
        onSave={handleSave} 
        isSaving={isSaving} 
        saveMessage={saveMessage}
      />
    </div>
  );
}