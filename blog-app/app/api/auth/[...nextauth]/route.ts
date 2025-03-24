import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

// Проверяем наличие секретного ключа
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret || nextAuthSecret.length === 0) {
  console.error('Ошибка: NEXTAUTH_SECRET не настроен в .env.local');
}

// Проверяем наличие GitHub ключей
const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
if (!githubId || !githubSecret) {
  console.error('Ошибка: GITHUB_ID или GITHUB_SECRET не настроены в .env.local');
} else {
  console.log('GitHub ключи настроены:', { 
    GITHUB_ID: githubId.substring(0, 5) + '...',
    GITHUB_SECRET: githubSecret.substring(0, 5) + '...'
  });
}

// Проверяем настройки URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
console.log('Настройки URL:', { 
  NEXTAUTH_URL: nextAuthUrl,
  BASE_URL: process.env.VERCEL_URL || 'http://localhost:3000'
});

// Здесь будет наша кастомная логика для WebAuthn
// Пока настроим базовую авторизацию с GitHub и заглушкой для WebAuthn

export const authOptions: NextAuthOptions = {
  // Настройка путей для страниц авторизации в App Router
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  debug: true, // Включаем режим отладки
  secret: process.env.NEXTAUTH_SECRET, // Явно указываем секретный ключ
  providers: [
    // GitHub провайдер для альтернативной авторизации
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          // Запрашиваем доступ к профилю и email
          scope: 'read:user user:email',
        },
      },
      token: {
        url: "https://github.com/login/oauth/access_token",
      },
      userinfo: {
        url: "https://api.github.com/user",
      },
      // Выводим значения переменных для отладки
      profile(profile) {
        console.log('GitHub profile:', profile);
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url
        };
      }
    }),
    
    // Заглушка для WebAuthn (будет расширена позже)
    CredentialsProvider({
      name: "WebAuthn",
      credentials: {
        // Упрощаем процесс авторизации - не требуем ввода данных
      },
      async authorize() {
        // Временная заглушка для авторизации
        // Здесь будет логика WebAuthn
        
        // Для тестирования разрешаем вход без проверки
        // В реальном приложении здесь будет проверка в базе данных
        return {
          id: "1",
          name: "Тестовый пользователь",
          email: "test@example.com",
          image: "https://avatars.githubusercontent.com/u/1?v=4"
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Добавляем отладочный вывод при входе
      console.log('signIn callback:', { user, account, profile });
      return true;
    },
    async jwt({ token, user, account }) {
      // Добавляем отладочный вывод
      console.log('jwt callback:', { token, user, account });
      
      // Добавляем пользовательские данные в JWT токен
      if (user) {
        token.id = user.id;
        token.role = "user"; // Роль для Hasura
      }
      return token;
    },
    async session({ session, token }) {
      // Добавляем отладочный вывод
      console.log('session callback:', { session, token });
      
      // Добавляем пользовательские данные в сессию
      if (session.user) {
        session.user.id = token.id as string;
        // Добавляем Hasura claims для клиентской стороны
        (session as any).hasuraClaims = {
          "x-hasura-allowed-roles": ["user", "anonymous"],
          "x-hasura-default-role": "user",
          "x-hasura-user-id": token.id,
        };
        
        // Генерируем JWT токен для клиента
        const jwtClaims = {
          sub: token.id as string,
          id: token.id as string,
          name: token.name,
          email: token.email,
          picture: token.picture,
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user", "anonymous"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": token.id as string,
          }
        };
        
        // Добавляем JWT токен в сессию
        // Создаем JWT токен напрямую с помощью jsonwebtoken
        const jwtSecret = process.env.NEXTAUTH_SECRET || '';
        console.log('JWT Secret length:', jwtSecret.length);
        
        try {
          (session as any).token = jwt.sign(jwtClaims, jwtSecret, { 
            algorithm: 'HS256',
            expiresIn: '30d'
          });
        } catch (error) {
          console.error('JWT sign error:', error);
        }
      }
      return session;
    }
  },
  // Добавляем кастомные методы JWT для Hasura
  jwt: {
    encode: async ({ secret, token }) => {
      if (!token) return "";
      
      const payload = {
        ...token,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user", "anonymous"],
          "x-hasura-default-role": "user",
          "x-hasura-user-id": token.id,
        },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 дней
      };
      
      // Используем jsonwebtoken для создания JWT токена
      return jwt.sign(payload, secret, { algorithm: 'HS256' });
    },
    decode: async ({ token }) => {
      // Используем стандартный JWT decode из NextAuth
      if (!token) return null;
      return JSON.parse(token) as JWT;
    }
  },
}

// Экспортируем обработчики GET и POST для API роута
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
