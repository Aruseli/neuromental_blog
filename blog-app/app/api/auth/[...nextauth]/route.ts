import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

// Здесь будет наша кастомная логика для WebAuthn
// Пока настроим базовую авторизацию с GitHub и заглушкой для WebAuthn

export const authOptions: NextAuthOptions = {
  // Настройка путей для страниц авторизации в App Router
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  providers: [
    // GitHub провайдер для альтернативной авторизации
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    
    // Заглушка для WebAuthn (будет расширена позже)
    CredentialsProvider({
      name: "WebAuthn",
      credentials: {
        username: { label: "Имя пользователя", type: "text" },
      },
      async authorize(credentials) {
        // Временная заглушка для авторизации
        // Здесь будет логика WebAuthn
        if (credentials?.username) {
          // В реальном приложении здесь будет проверка в базе данных
          // и получение реального ID пользователя
          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@example.com`,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  callbacks: {
    async jwt({ token, user }) {
      // Добавляем пользовательские данные в JWT токен
      if (user) {
        token.id = user.id;
        token.role = "user"; // Роль для Hasura
      }
      return token;
    },
    async session({ session, token }) {
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
        (session as any).token = jwt.sign(jwtClaims, jwtSecret, { 
          algorithm: 'HS256',
          expiresIn: '30d'
        });
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
