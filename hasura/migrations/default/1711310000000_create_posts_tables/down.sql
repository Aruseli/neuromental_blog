-- Удаляем триггеры
DROP TRIGGER IF EXISTS set_post_blocks_updated_at ON public.post_blocks;
DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;

-- Удаляем индексы
DROP INDEX IF EXISTS idx_post_blocks_post_id;
DROP INDEX IF EXISTS idx_posts_published_at;
DROP INDEX IF EXISTS idx_posts_status;
DROP INDEX IF EXISTS idx_posts_author_id;

-- Удаляем таблицы
DROP TABLE IF EXISTS public.post_blocks;
DROP TABLE IF EXISTS public.posts;

-- Удаляем функцию
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at();
