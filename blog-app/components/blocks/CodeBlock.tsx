'use client';

import { useState } from 'react';

interface CodeBlockProps {
  content: {
    code: string;
    language: string;
  };
  onChange: (content: { code: string; language: string }) => void;
  isPreview: boolean;
}

export default function CodeBlock({ content, onChange, isPreview }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Список поддерживаемых языков программирования
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'plaintext', label: 'Plain Text' },
  ];

  // Обработчик изменения кода
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...content,
      code: e.target.value,
    });
  };

  // Обработчик изменения языка
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...content,
      language: e.target.value,
    });
  };

  // Функция для копирования кода в буфер обмена
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block">
      {!isPreview ? (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Язык</label>
            <select
              value={content.language}
              onChange={handleLanguageChange}
              className="border rounded p-2"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Код</label>
            <textarea
              value={content.code}
              onChange={handleCodeChange}
              placeholder="Введите код"
              className="border rounded p-2 font-mono text-sm min-h-[200px]"
            />
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-700 text-gray-200">
                <span>{languages.find(l => l.value === content.language)?.label || content.language}</span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
              <pre className="p-4 text-gray-200 overflow-x-auto">
                <code>{content.code}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-700 text-gray-200">
            <span>{languages.find(l => l.value === content.language)?.label || content.language}</span>
            <button
              onClick={copyToClipboard}
              className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
            >
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
          <pre className="p-4 text-gray-200 overflow-x-auto">
            <code>{content.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}