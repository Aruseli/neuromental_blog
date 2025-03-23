import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Расширение типа User
   */
  interface User {
    id: string;
    role?: string;
  }

  /**
   * Расширение типа Session
   */
  interface Session {
    user: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
    hasuraClaims?: {
      "x-hasura-allowed-roles": string[];
      "x-hasura-default-role": string;
      "x-hasura-user-id": string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Расширение типа JWT
   */
  interface JWT {
    id: string;
    role?: string;
  }
}
