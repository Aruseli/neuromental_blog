'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageBlockProps {
  content: {
    url: string;
    caption: string;
    alt: string;
  };
  onChange: (content: { url: string; caption: string; alt: string }) => void;
  isPreview: boolean;
}

export default function ImageBlock({ content, onChange, isPreview }: ImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Функция для загрузки изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // В реальном приложении здесь будет загрузка на сервер
      // Для демонстрации используем FileReader для создания локального URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...content,
            url: event.target.result as string,
          });
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setError('Ошибка при чтении файла');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Ошибка при загрузке изображения');
      setIsUploading(false);
    }
  };

  // Обработчик изменения URL изображения
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...content,
      url: e.target.value,
    });
  };

  // Обработчик изменения подписи
  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...content,
      caption: e.target.value,
    });
  };

  // Обработчик изменения альтернативного текста
  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...content,
      alt: e.target.value,
    });
  };

  return (
    <div className="image-block">
      {!isPreview ? (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">URL изображения</label>
            <input
              type="text"
              value={content.url}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="border rounded p-2"
            />
            <div className="text-sm text-gray-500">или</div>
            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50">
              <div className="text-center">
                <div className="text-gray-600">Загрузить изображение</div>
                <div className="text-xs text-gray-400 mt-1">PNG, JPG, GIF до 10MB</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            {isUploading && <div className="text-blue-500">Загрузка...</div>}
            {error && <div className="text-red-500">{error}</div>}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Подпись</label>
            <input
              type="text"
              value={content.caption}
              onChange={handleCaptionChange}
              placeholder="Подпись к изображению"
              className="border rounded p-2"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Альтернативный текст</label>
            <input
              type="text"
              value={content.alt}
              onChange={handleAltChange}
              placeholder="Описание изображения для скринридеров"
              className="border rounded p-2"
            />
          </div>

          {content.url && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</div>
              <div className="relative border rounded overflow-hidden">
                <img
                  src={content.url}
                  alt={content.alt || 'Предпросмотр изображения'}
                  className="max-w-full h-auto"
                />
                {content.caption && (
                  <div className="text-sm text-center p-2 bg-gray-50">{content.caption}</div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {content.url ? (
            <figure className="relative">
              <img
                src={content.url}
                alt={content.alt || 'Изображение'}
                className="max-w-full h-auto rounded"
              />
              {content.caption && (
                <figcaption className="text-sm text-center p-2 text-gray-600">
                  {content.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="flex items-center justify-center border rounded-lg p-12 bg-gray-50">
              <div className="text-gray-400">Изображение не выбрано</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
