'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PostData, PostBlock, GridItem } from '@/types/post';
import { v4 as uuidv4 } from 'uuid';
import BlockToolbar from './BlockToolbar';
import PublishPanel from './PublishPanel';
import CodeBlock from './blocks/CodeBlock';
import QuoteBlock from './blocks/QuoteBlock';
import VideoBlock from './blocks/VideoBlock';
import ImageBlock from './blocks/ImageBlock';
import TextBlock from './blocks/TextBlock';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface PostEditorProps {
  post: PostData;
  onSave: (post: PostData, isPublish?: boolean) => Promise<void>;
  isSaving: boolean;
  saveMessage: string;
  isNew?: boolean;
}

export default function PostEditor({ post, onSave, isSaving, saveMessage, isNew = false }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [blocks, setBlocks] = useState<PostBlock[]>(post.post_blocks || []);
  const [layout, setLayout] = useState<GridItem[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishPanelOpen, setIsPublishPanelOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Инициализация макета из данных поста
  useEffect(() => {
    if (post.post_blocks && post.post_blocks.length > 0) {
      const initialLayout = post.post_blocks.map((block) => {
        // Если в layout_json есть информация о позиции блока, используем ее
        const layoutItem = post.layout_json?.[block.grid_id] || {
          x: 0,
          y: blocks.length, // По умолчанию добавляем в конец
          w: 12, // Полная ширина по умолчанию
          h: getDefaultHeight(block.type),
        };

        return {
          i: block.grid_id,
          x: layoutItem.x || 0,
          y: layoutItem.y || 0,
          w: layoutItem.w || 12,
          h: layoutItem.h || getDefaultHeight(block.type),
          minH: getMinHeight(block.type),
          minW: getMinWidth(block.type),
        };
      });

      setLayout(initialLayout);
    }
  }, [post.post_blocks, post.layout_json]);

  // Обновляем блоки при изменении поста
  useEffect(() => {
    setBlocks(post.post_blocks || []);
    setTitle(post.title);
  }, [post]);

  // Функция для получения стандартной высоты блока в зависимости от типа
  const getDefaultHeight = (type: string): number => {
    switch (type) {
      case 'text':
        return 6;
      case 'image':
        return 9;
      case 'gallery':
        return 12;
      case 'video':
        return 10;
      case 'quote':
        return 4;
      case 'code':
        return 8;
      case 'embed':
        return 10;
      default:
        return 6;
    }
  };

  // Функция для получения минимальной высоты блока
  const getMinHeight = (type: string): number => {
    switch (type) {
      case 'text':
        return 3;
      case 'image':
        return 6;
      case 'gallery':
        return 8;
      case 'video':
        return 6;
      case 'quote':
        return 3;
      case 'code':
        return 4;
      case 'embed':
        return 6;
      default:
        return 3;
    }
  };

  // Функция для получения минимальной ширины блока
  const getMinWidth = (type: string): number => {
    switch (type) {
      case 'text':
        return 3;
      case 'image':
        return 4;
      case 'gallery':
        return 6;
      case 'video':
        return 6;
      case 'quote':
        return 4;
      case 'code':
        return 6;
      case 'embed':
        return 6;
      default:
        return 3;
    }
  };

  // Добавление нового блока
  const handleAddBlock = (type: string) => {
    const gridId = `block_${uuidv4()}`;
    const newBlock: PostBlock = {
      id: `temp_${uuidv4()}`, // Временный ID, будет заменен после сохранения
      type: type as any,
      content: getDefaultContent(type),
      grid_id: gridId,
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);

    // Добавляем блок в конец макета
    const newLayoutItem: GridItem = {
      i: gridId,
      x: 0,
      y: layout.length > 0 ? Math.max(...layout.map(item => item.y + item.h)) : 0,
      w: 12,
      h: getDefaultHeight(type),
      minH: getMinHeight(type),
      minW: getMinWidth(type),
    };

    setLayout([...layout, newLayoutItem]);
    setIsDirty(true);
  };

  // Получение стандартного содержимого для нового блока
  const getDefaultContent = (type: string): any => {
    switch (type) {
      case 'text':
        return { text: '<p>Введите текст здесь...</p>' };
      case 'image':
        return { url: '', caption: '', alt: '' };
      case 'gallery':
        return { images: [] };
      case 'video':
        return { url: '', caption: '' };
      case 'quote':
        return { text: 'Цитата', author: 'Автор' };
      case 'code':
        return { code: '// Ваш код', language: 'javascript' };
      case 'embed':
        return { html: '', caption: '' };
      default:
        return {};
    }
  };

  // Обновление содержимого блока
  const handleUpdateBlock = (gridId: string, content: any) => {
    const updatedBlocks = blocks.map(block => {
      if (block.grid_id === gridId) {
        return { ...block, content };
      }
      return block;
    });

    setBlocks(updatedBlocks);
    setIsDirty(true);
  };

  // Удаление блока
  const handleDeleteBlock = (gridId: string) => {
    const updatedBlocks = blocks.map(block => {
      if (block.grid_id === gridId) {
        return { ...block, _deleted: true };
      }
      return block;
    });

    setBlocks(updatedBlocks);
    
    // Удаляем блок из макета
    const updatedLayout = layout.filter(item => item.i !== gridId);
    setLayout(updatedLayout);
    setIsDirty(true);
  };

  // Обработка изменения макета
  const handleLayoutChange = (newLayout: GridItem[]) => {
    setLayout(newLayout);
    setIsDirty(true);
  };

  // Сохранение поста
  const handleSave = async (isPublish = false) => {
    // Создаем объект layout_json из текущего макета
    const layoutJson = layout.reduce((acc, item) => {
      acc[item.i] = {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      };
      return acc;
    }, {} as Record<string, any>);

    // Фильтруем удаленные блоки для отображения
    const visibleBlocks = blocks.filter(block => !block._deleted);

    // Обновляем данные поста
    const updatedPost: PostData = {
      ...post,
      title,
      post_blocks: blocks, // Включаем все блоки, включая удаленные
      layout_json: layoutJson,
    };

    await onSave(updatedPost, isPublish);
    setIsDirty(false);
  };

  // Обработка публикации
  const handlePublish = async (publishSettings: any) => {
    const updatedPost: PostData = {
      ...post,
      title,
      excerpt: publishSettings.excerpt,
      slug: publishSettings.slug,
      status: publishSettings.status,
      scheduled_at: publishSettings.status === 'scheduled' ? publishSettings.scheduledDate?.toISOString() : undefined,
      post_blocks: blocks,
      layout_json: layout.reduce((acc, item) => {
        acc[item.i] = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
        return acc;
      }, {} as Record<string, any>),
    };

    await onSave(updatedPost, publishSettings.status === 'published');
    setIsPublishPanelOpen(false);
    setIsDirty(false);
  };

  // Рендерим блок в зависимости от его типа
  const renderBlock = (block: PostBlock) => {
    if (block._deleted) return null;

    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            content={block.content}
            onChange={(content) => handleUpdateBlock(block.grid_id, content)}
            isPreview={isPreview}
          />
        );
      case 'image':
        return (
          <ImageBlock
            content={block.content}
            onChange={(content) => handleUpdateBlock(block.grid_id, content)}
            isPreview={isPreview}
          />
        );
      case 'video':
        return (
          <VideoBlock
            content={block.content}
            onChange={(content) => handleUpdateBlock(block.grid_id, content)}
            isPreview={isPreview}
          />
        );
      case 'quote':
        return (
          <QuoteBlock
            content={block.content}
            onChange={(content) => handleUpdateBlock(block.grid_id, content)}
            isPreview={isPreview}
          />
        );
      case 'code':
        return (
          <CodeBlock
            content={block.content}
            onChange={(content) => handleUpdateBlock(block.grid_id, content)}
            isPreview={isPreview}
          />
        );
      default:
        return <div>Неподдерживаемый тип блока: {block.type}</div>;
    }
  };

  // Предупреждение при попытке покинуть страницу с несохраненными изменениями
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Верхняя панель */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              className="text-2xl font-bold border-none focus:outline-none focus:ring-0 w-full"
              placeholder="Название поста"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`px-4 py-2 rounded ${
                isPreview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isPreview ? 'Редактирование' : 'Предпросмотр'}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={() => setIsPublishPanelOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Опубликовать
            </button>
          </div>
        </div>
        {saveMessage && (
          <div className="bg-green-50 text-green-700 text-center py-1">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Основной контент */}
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Сетка блоков */}
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={handleLayoutChange}
            isDraggable={!isPreview}
            isResizable={!isPreview}
            margin={[20, 20]}
          >
            {blocks
              .filter(block => !block._deleted)
              .map(block => (
                <div key={block.grid_id} className="bg-white rounded-lg shadow">
                  {!isPreview && (
                    <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
                      <span className="text-sm font-medium text-gray-700">
                        {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDeleteBlock(block.grid_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                  <div className="p-4 h-full overflow-auto">
                    {renderBlock(block)}
                  </div>
                </div>
              ))}
          </ResponsiveGridLayout>

          {/* Панель инструментов для добавления блоков */}
          {!isPreview && (
            <BlockToolbar onAddBlock={handleAddBlock} />
          )}
        </div>
      </div>

      {/* Панель публикации */}
      {isPublishPanelOpen && (
        <PublishPanel
          post={post}
          onClose={() => setIsPublishPanelOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
