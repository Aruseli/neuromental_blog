-- Создание таблиц для блога

-- Таблица пользователей
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "image" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица учетных данных WebAuthn
CREATE TABLE "webauthn_credentials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "credential_id" TEXT NOT NULL UNIQUE,
  "public_key" TEXT NOT NULL,
  "counter" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица постов
CREATE TABLE "posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "excerpt" TEXT,
  "cover_image" TEXT,
  "status" TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  "layout_json" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "published_at" TIMESTAMP WITH TIME ZONE,
  "scheduled_at" TIMESTAMP WITH TIME ZONE
);

-- Таблица блоков контента
CREATE TABLE "post_blocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "grid_id" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица аккаунтов социальных сетей
CREATE TABLE "social_accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "platform" TEXT NOT NULL CHECK (platform IN ('vk', 'telegram', 'thread')),
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT,
  "token_expires_at" TIMESTAMP WITH TIME ZONE,
  "platform_user_id" TEXT NOT NULL,
  "platform_username" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE ("user_id", "platform")
);

-- Таблица публикаций в социальных сетях
CREATE TABLE "social_publications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "social_account_id" UUID NOT NULL REFERENCES "social_accounts"("id") ON DELETE CASCADE,
  "platform" TEXT NOT NULL CHECK (platform IN ('vk', 'telegram', 'thread')),
  "status" TEXT NOT NULL CHECK (status IN ('pending', 'published', 'failed', 'scheduled')),
  "external_url" TEXT,
  "external_id" TEXT,
  "published_at" TIMESTAMP WITH TIME ZONE,
  "scheduled_at" TIMESTAMP WITH TIME ZONE,
  "error_message" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица статистики публикаций
CREATE TABLE "social_stats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "publication_id" UUID NOT NULL REFERENCES "social_publications"("id") ON DELETE CASCADE,
  "views" INTEGER NOT NULL DEFAULT 0,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "comments" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "collected_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подписчиков
CREATE TABLE "subscribers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "status" TEXT NOT NULL CHECK (status IN ('active', 'unsubscribed')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX "idx_posts_author" ON "posts" ("author_id");
CREATE INDEX "idx_posts_status" ON "posts" ("status");
CREATE INDEX "idx_post_blocks_post" ON "post_blocks" ("post_id");
CREATE INDEX "idx_social_accounts_user" ON "social_accounts" ("user_id");
CREATE INDEX "idx_social_publications_post" ON "social_publications" ("post_id");
CREATE INDEX "idx_social_publications_account" ON "social_publications" ("social_account_id");
CREATE INDEX "idx_social_stats_publication" ON "social_stats" ("publication_id");

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON "posts"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_post_blocks_updated_at
BEFORE UPDATE ON "post_blocks"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_social_accounts_updated_at
BEFORE UPDATE ON "social_accounts"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON "subscribers"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
