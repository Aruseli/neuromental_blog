-- Удаление триггеров
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON "subscribers";
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON "social_accounts";
DROP TRIGGER IF EXISTS update_post_blocks_updated_at ON "post_blocks";
DROP TRIGGER IF EXISTS update_posts_updated_at ON "posts";
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";

-- Удаление функции
DROP FUNCTION IF EXISTS update_updated_at();

-- Удаление индексов
DROP INDEX IF EXISTS "idx_social_stats_publication";
DROP INDEX IF EXISTS "idx_social_publications_account";
DROP INDEX IF EXISTS "idx_social_publications_post";
DROP INDEX IF EXISTS "idx_social_accounts_user";
DROP INDEX IF EXISTS "idx_post_blocks_post";
DROP INDEX IF EXISTS "idx_posts_status";
DROP INDEX IF EXISTS "idx_posts_author";

-- Удаление таблиц
DROP TABLE IF EXISTS "subscribers";
DROP TABLE IF EXISTS "social_stats";
DROP TABLE IF EXISTS "social_publications";
DROP TABLE IF EXISTS "social_accounts";
DROP TABLE IF EXISTS "post_blocks";
DROP TABLE IF EXISTS "posts";
DROP TABLE IF EXISTS "webauthn_credentials";
DROP TABLE IF EXISTS "users";
