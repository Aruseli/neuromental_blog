'use client';

import { useState } from 'react';

interface BlockToolbarProps {
  onAddBlock: (type: string) => void;
}

export const BlockToolbar = ({ onAddBlock }: BlockToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const blockTypes = [
    { type: 'text', label: 'Текст', icon: '📝' },
    { type: 'image', label: 'Изображение', icon: '🖼️' },
    { type: 'video', label: 'Видео', icon: '🎬' },
    { type: 'quote', label: 'Цитата', icon: '💬' },
    { type: 'code', label: 'Код', icon: '💻' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-10">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 w-64">
            <h3 className="text-lg font-medium mb-3">Добавить блок</h3>
            <div className="space-y-2">
              {blockTypes.map((block) => (
                <button
                  key={block.type}
                  onClick={() => {
                    onAddBlock(block.type);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                >
                  <span className="mr-2 text-xl">{block.icon}</span>
                  <span>{block.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700"
        >
          {isOpen ? '✕' : '+'}
        </button>
      </div>
    </div>
  );
}