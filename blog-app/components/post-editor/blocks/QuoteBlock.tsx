'use client';

interface QuoteBlockProps {
  content: {
    text: string;
    author: string;
  };
  onChange: (content: { text: string; author: string }) => void;
  isPreview: boolean;
}

export default function QuoteBlock({ content, onChange, isPreview }: QuoteBlockProps) {
  // Обработчик изменения текста цитаты
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...content,
      text: e.target.value,
    });
  };

  // Обработчик изменения автора цитаты
  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...content,
      author: e.target.value,
    });
  };

  return (
    <div className="quote-block">
      {!isPreview ? (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Текст цитаты</label>
            <textarea
              value={content.text}
              onChange={handleTextChange}
              placeholder="Введите текст цитаты"
              className="border rounded p-2 min-h-[100px]"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Автор</label>
            <input
              type="text"
              value={content.author}
              onChange={handleAuthorChange}
              placeholder="Имя автора"
              className="border rounded p-2"
            />
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</div>
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic">
              {content.text}
              {content.author && (
                <footer className="text-right mt-2 text-sm font-medium">
                  — {content.author}
                </footer>
              )}
            </blockquote>
          </div>
        </div>
      ) : (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic">
          {content.text}
          {content.author && (
            <footer className="text-right mt-2 text-sm font-medium">
              — {content.author}
            </footer>
          )}
        </blockquote>
      )}
    </div>
  );
}
