'use client';

import { useState, useEffect } from 'react';

interface VideoBlockProps {
  content: {
    url: string;
    caption: string;
  };
  onChange: (content: { url: string; caption: string; embedCode?: string }) => void;
  isPreview: boolean;
}

export default function VideoBlock({ content, onChange, isPreview }: VideoBlockProps) {
  const [embedCode, setEmbedCode] = useState('');
  const [error, setError] = useState('');

  // Функция для получения ID видео из URL YouTube
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Функция для получения ID видео из URL Vimeo
  const getVimeoVideoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  };

  // Обновляем код встраивания при изменении URL
  useEffect(() => {
    if (!content.url) {
      setEmbedCode('');
      setError('');
      return;
    }

    try {
      const url = new URL(content.url);
      
      // Проверяем, является ли URL видео с YouTube
      const youtubeId = getYouTubeVideoId(content.url);
      if (youtubeId) {
        setEmbedCode(`<iframe width="100%" height="315" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
        setError('');
        return;
      }

      // Проверяем, является ли URL видео с Vimeo
      const vimeoId = getVimeoVideoId(content.url);
      if (vimeoId) {
        setEmbedCode(`<iframe src="https://player.vimeo.com/video/${vimeoId}" width="100%" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`);
        setError('');
        return;
      }

      // Если URL не распознан как видео с YouTube или Vimeo
      setError('Поддерживаются только ссылки на YouTube и Vimeo');
      setEmbedCode('');
    } catch (err) {
      setError('Неверный URL');
      setEmbedCode('');
    }
  }, [content.url]);

  // Обработчик изменения URL видео
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

  return (
    <div className="video-block">
      {!isPreview ? (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">URL видео</label>
            <input
              type="text"
              value={content.url}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border rounded p-2"
            />
            <div className="text-xs text-gray-500">
              Поддерживаются ссылки на YouTube и Vimeo
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Подпись</label>
            <input
              type="text"
              value={content.caption}
              onChange={handleCaptionChange}
              placeholder="Подпись к видео"
              className="border rounded p-2"
            />
          </div>

          {embedCode && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</div>
              <div
                className="border rounded overflow-hidden"
                dangerouslySetInnerHTML={{ __html: embedCode }}
              />
              {content.caption && (
                <div className="text-sm text-center p-2 bg-gray-50">{content.caption}</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {embedCode ? (
            <figure>
              <div
                className="rounded overflow-hidden"
                dangerouslySetInnerHTML={{ __html: embedCode }}
              />
              {content.caption && (
                <figcaption className="text-sm text-center p-2 text-gray-600">
                  {content.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="flex items-center justify-center border rounded-lg p-12 bg-gray-50">
              <div className="text-gray-400">
                {error || 'URL видео не указан'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
