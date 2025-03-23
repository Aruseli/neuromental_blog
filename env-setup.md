# Настройка переменных окружения

## Локальная разработка

Создайте файл `.env.local` в директории `blog-app` со следующими переменными:

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# GitHub OAuth (опционально)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Hasura
NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=myadminsecretkey
HASURA_JWT_SECRET=your-jwt-secret-key-min-32-chars-long

# Социальные сети
VK_CLIENT_ID=your-vk-client-id
VK_CLIENT_SECRET=your-vk-client-secret
VK_REDIRECT_URI=http://localhost:3000/api/social/auth/vk/callback

TELEGRAM_BOT_TOKEN=your-telegram-bot-token

META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/api/social/auth/meta/callback
```

## Продакшн (Vercel + Hasura Cloud)

Для продакшн окружения настройте следующие переменные в Vercel:

```
# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# GitHub OAuth (опционально)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Hasura
NEXT_PUBLIC_HASURA_ENDPOINT=https://your-hasura-app.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret
HASURA_JWT_SECRET=your-jwt-secret-key-min-32-chars-long

# Социальные сети
VK_CLIENT_ID=your-vk-client-id
VK_CLIENT_SECRET=your-vk-client-secret
VK_REDIRECT_URI=https://yourdomain.com/api/social/auth/vk/callback

TELEGRAM_BOT_TOKEN=your-telegram-bot-token

META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://yourdomain.com/api/social/auth/meta/callback
```

## Настройка Hasura Cloud

1. Создайте проект в [Hasura Cloud](https://cloud.hasura.io/)
2. Подключите базу данных PostgreSQL (можно использовать Heroku PostgreSQL, Supabase или другой провайдер)
3. Настройте переменные окружения в проекте Hasura Cloud:
   - `HASURA_GRAPHQL_JWT_SECRET`: `{"type":"HS256", "key":"your-jwt-secret-key-min-32-chars-long"}`
   - `HASURA_GRAPHQL_ADMIN_SECRET`: `your-hasura-admin-secret`
   - `HASURA_GRAPHQL_UNAUTHORIZED_ROLE`: `anonymous`

4. Примените миграции и метаданные через Hasura CLI:
   ```bash
   hasura migrate apply --endpoint https://your-hasura-app.hasura.app --admin-secret your-hasura-admin-secret
   hasura metadata apply --endpoint https://your-hasura-app.hasura.app --admin-secret your-hasura-admin-secret
   ```

## Настройка Vercel

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в проекте Vercel
3. Настройте домен (опционально)
4. Деплой будет происходить автоматически при пуше в основную ветку

## Переключение между окружениями

Для переключения между локальной разработкой и продакшн окружением:

1. В `blog-app/lib/hasura/client.ts` уже настроено получение URL Hasura из переменной окружения `NEXT_PUBLIC_HASURA_ENDPOINT`
2. В `blog-app/app/api/auth/[...nextauth]/route.ts` JWT секрет должен совпадать с секретом, настроенным в Hasura

Убедитесь, что JWT секрет одинаковый в обоих окружениях для корректной работы авторизации.
