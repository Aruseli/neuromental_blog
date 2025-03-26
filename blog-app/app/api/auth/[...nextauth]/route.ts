import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import jwt from 'jsonwebtoken';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Include user information in the token
      if (user) {
        token.userId = user.id;
        token.role = 'user';
      }

      // Generate a proper JWT for Hasura
      const hasuraJWT = jwt.sign(
        {
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user", "anonymous"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": token.sub,
          },
        },
        process.env.HASURA_JWT_SECRET!,
        { algorithm: 'HS256' }
      );

      token.hasuraToken = hasuraJWT;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session) {
        (session as any).token = token.hasuraToken;
        (session as any).userId = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
