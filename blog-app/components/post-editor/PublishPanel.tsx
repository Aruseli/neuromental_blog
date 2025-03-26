'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PostData, PublishSettings } from '@/types/post';

interface PublishPanelProps {
  post: PostData;
  onClose: () => void;
  onPublish: (settings: PublishSettings) => Promise<void>;
}

export const PublishPanel = ({ post, onClose, onPublish }: PublishPanelProps) => {
  const [settings, setSettings] = useState<PublishSettings>({
    status: post.status || 'draft',
    slug: post.slug || generateSlug(post.title),
    excerpt: post.excerpt || '',
  });
  
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Инициализация даты и времени публикации, если они уже установлены
  useEffect(() => {
    if (post.scheduled_at) {
      const date = new Date(post.scheduled_at);
      setScheduledDate(format(date, 'yyyy-MM-dd'));
      setScheduledTime(format(date, 'HH:mm'));
      setSettings(prev => ({
        ...prev,
        status: 'scheduled',
      }));
    } else {
      // Устанавливаем время по умолчанию на текущее время + 1 час
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      setScheduledDate(format(defaultDate, 'yyyy-MM-dd'));
      setScheduledTime(format(defaultDate, 'HH:mm'));
    }
  }, [post.scheduled_at]);

  // Генерация slug из заголовка
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
      .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
      .replace(/--+/g, '-') // Заменяем множественные дефисы на один
      .trim();
  }

  // Обработчик изменения статуса публикации
  const handleStatusChange = (status: 'draft' | 'published' | 'scheduled') => {
    setSettings(prev => ({
      ...prev,
      status,
    }));
  };

  // Обработчик изменения slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    }));
  };

  // Обработчик изменения аннотации
  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings(prev => ({
      ...prev,
      excerpt: e.target.value,
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Проверяем, что slug не пустой
      if (!settings.slug) {
        throw new Error('URL поста не может быть пустым');
      }

      // Если статус "scheduled", проверяем, что дата и время установлены
      if (settings.status === 'scheduled') {
        if (!scheduledDate || !scheduledTime) {
          throw new Error('Пожалуйста, укажите дату и время публикации');
        }

        // Создаем объект Date из даты и времени
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        
        // Проверяем, что дата в будущем
        if (scheduledDateTime <= new Date()) {
          throw new Error('Дата публикации должна быть в будущем');
        }

        // Добавляем дату публикации в настройки
        setSettings(prev => ({
          ...prev,
          scheduledDate: scheduledDateTime,
        }));

        // Вызываем функцию публикации с обновленными настройками
        await onPublish({
          ...settings,
          scheduledDate: scheduledDateTime,
        });
      } else {
        // Вызываем функцию публикации с текущими настройками
        await onPublish(settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при публикации');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Настройки публикации</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Статус публикации */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('draft')}
                  className={`py-2 px-4 border rounded-md ${
                    settings.status === 'draft'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  Черновик
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('published')}
                  className={`py-2 px-4 border rounded-md ${
                    settings.status === 'published'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  Опубликовать
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('scheduled')}
                  className={`py-2 px-4 border rounded-md ${
                    settings.status === 'scheduled'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  По расписанию
                </button>
              </div>
            </div>

            {/* Настройки расписания */}
            {settings.status === 'scheduled' && (
              <div className="bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата и время публикации
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="border rounded-md p-2"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border rounded-md p-2"
                    required
                  />
                </div>
              </div>
            )}

            {/* URL поста */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL поста
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">/posts/</span>
                <input
                  type="text"
                  value={settings.slug}
                  onChange={handleSlugChange}
                  className="flex-1 border rounded-md p-2"
                  placeholder="url-posta"
                  required
                />
              </div>
            </div>

            {/* Аннотация */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Аннотация
              </label>
              <textarea
                value={settings.excerpt}
                onChange={handleExcerptChange}
                className="w-full border rounded-md p-2 h-24"
                placeholder="Краткое описание поста (отображается в списке постов и при шеринге в соцсетях)"
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Сохранение...'
                  : settings.status === 'published'
                  ? 'Опубликовать'
                  : settings.status === 'scheduled'
                  ? 'Запланировать'
                  : 'Сохранить как черновик'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}