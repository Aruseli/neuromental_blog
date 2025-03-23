# Настройка GitHub OAuth для NextAuth

Для работы авторизации через GitHub в NextAuth необходимо:

1. Создать OAuth приложение на GitHub:
   - Перейти на https://github.com/settings/developers
   - Нажать "New OAuth App"
   - Заполнить форму:
     - **Application name**: NeutoMental Blog
     - **Homepage URL**: http://localhost:3000
     - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github

2. После создания приложения вы получите `Client ID` и `Client Secret`

3. Создать файл `.env.local` в директории `blog-app` со следующим содержимым:
```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# GitHub OAuth
GITHUB_ID=Ov23liJJHaayYOwEaiMK
GITHUB_SECRET=13dcb81186e79aa69c845a5aa5a62de02e584615

# Hasura
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=myadminsecretkey
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-jwt-secret-key-here"}
```

4. Заменить значения `your-github-client-id` и `your-github-client-secret` на полученные при создании OAuth приложения

5. Сгенерировать секретные ключи для NextAuth и JWT:
```bash
# Для NEXTAUTH_SECRET
openssl rand -base64 32

# Для HASURA_GRAPHQL_JWT_SECRET
openssl rand -base64 32
```

6. Перезапустить Next.js приложение:
```bash
npm run dev
```

После этих шагов авторизация через GitHub должна работать корректно.
