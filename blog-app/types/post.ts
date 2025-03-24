// Типы для блоков контента
export type BlockType = 'text' | 'image' | 'gallery' | 'video' | 'quote' | 'code' | 'embed';

// Интерфейс для блока контента
export interface PostBlock {
  id?: string;
  post_id?: string;
  type: BlockType;
  content: any;
  grid_id: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean; // Флаг для отметки блоков на удаление
}

// Интерфейс для данных поста
export interface PostData {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string;
  status: 'draft' | 'published' | 'scheduled';
  layout_json: any;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string;
  post_blocks: PostBlock[];
  author?: {
    id?: string;
    name?: string;
    image?: string;
  };
}

// Интерфейс для настроек сетки
export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

// Интерфейс для настроек публикации
export interface PublishSettings {
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: Date;
  slug: string;
  excerpt: string;
}
