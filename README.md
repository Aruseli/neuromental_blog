# Neuromental Blog

Персональный блог с интеграцией социальных сетей и расширенными возможностями публикации контента.

## Технологии

- **Frontend**: Next.js 14, React, Tailwind CSS, Apollo Client
- **Backend**: Hasura GraphQL Engine, PostgreSQL
- **Авторизация**: NextAuth.js с JWT интеграцией для Hasura
- **Деплой**: Docker, Docker Compose

## Структура проекта

- `blog-app/` - Next.js приложение
- `hasura/` - Конфигурация Hasura и Docker Compose

## Основные возможности

- Авторизация через социальные сети (GitHub)
- Создание и публикация постов с различными типами блоков контента
- Интеграция с социальными сетями для кросс-постинга
- Аналитика публикаций
- Управление подписчиками

## Схема данных

1. **Основные таблицы**:
   - users - пользователи системы
   - posts - посты блога с поддержкой сетки (layout_json)
   - post_blocks - блоки контента в постах (текст, изображения, видео и т.д.)

2. **Таблицы для соцсетей**:
   - social_accounts - подключенные аккаунты соцсетей
   - social_publications - публикации в соцсетях
   - social_stats - статистика по публикациям

3. **Таблицы для авторизации**:
   - webauthn_credentials - учетные данные для биометрической авторизации

4. **Дополнительные таблицы**:
   - subscribers - подписчики блога

## Установка и запуск

### Предварительные требования

- Node.js 18+
- Docker и Docker Compose
- Git

### Шаги по установке

1. Клонировать репозиторий:
```bash
git clone https://github.com/Aruseli/neuromental_blog.git
cd neuromental_blog
```

2. Установить зависимости:
```bash
cd blog-app
npm install
```

3. Создать файл `.env.local` в директории `blog-app` с необходимыми переменными окружения:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:8080/v1/graphql
```

4. Запустить Hasura и PostgreSQL через Docker Compose:
```bash
cd ../hasura
docker-compose up -d
```

5. Запустить Next.js приложение:
```bash
cd ../blog-app
npm run dev
```

6. Открыть приложение в браузере: http://localhost:3000

## Лицензия

MIT
