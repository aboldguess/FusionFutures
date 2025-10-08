/**
 * ============================================================================
 * File: apps/web/app/api/auth/[...nextauth]/route.ts
 * Purpose: Configure Auth.js (NextAuth) credentials provider with role-based session data.
 * Structure: Exports GET/POST handlers consumed by the Next.js App Router.
 * Usage: Automatically invoked for authentication flows in the web app.
 * ============================================================================
 */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        // Demo users seeded via API; fallback to static roles for offline development.
        if (credentials.email === "admin@fusionfutures.dev" && credentials.password === "adminpass") {
          return {
            id: "admin-1",
            name: "Alex Admin",
            email: credentials.email,
            role: "admin",
          } as never;
        }

        return {
          id: "user-1",
          name: "Jamie Demo",
          email: credentials.email,
          role: "user",
        } as never;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
  pages: {
    signIn: "/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
