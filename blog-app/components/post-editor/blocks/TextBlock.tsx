'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface TextBlockProps {
  content: { text: string };
  onChange: (content: { text: string }) => void;
  isPreview: boolean;
}

export default function TextBlock({ content, onChange, isPreview }: TextBlockProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Введите текст...',
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: content.text || '<p>Введите текст здесь...</p>',
    editable: !isPreview,
    onUpdate: ({ editor }) => {
      onChange({ text: editor.getHTML() });
    },
  });

  // Обновляем содержимое редактора при изменении props
  useEffect(() => {
    if (editor && content.text !== editor.getHTML()) {
      editor.commands.setContent(content.text || '<p>Введите текст здесь...</p>');
    }
  }, [content.text, editor]);

  // Обновляем режим редактирования
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview);
    }
  }, [isPreview, editor]);

  if (!editor) {
    return <div>Загрузка редактора...</div>;
  }

  return (
    <div className="text-block">
      {!isPreview && (
        <div className="border-b pb-2 mb-3 flex space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${
              editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Жирный"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${
              editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Курсив"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Заголовок 2"
          >
            <span className="font-semibold">H2</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 rounded ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Заголовок 3"
          >
            <span className="font-semibold">H3</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${
              editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Маркированный список"
          >
            <span>•</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${
              editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Нумерованный список"
          >
            <span>1.</span>
          </button>
          <button
            onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-1 rounded ${
              editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="Ссылка"
          >
            <span>🔗</span>
          </button>
        </div>
      )}
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
}
