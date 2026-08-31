import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";

const REVALIDATE_MS = 5 * 60_000;

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/giris" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const limited = rateLimit(`login:${email.toLowerCase()}`, {
          limit: 8,
          windowMs: 15 * 60_000,
        });
        if (!limited.ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.active = true;
        token.checkedAt = Date.now();
        delete token.error;
        return token;
      }

      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") token.name = session.user.name;
        if (typeof session.user.email === "string") token.email = session.user.email;
        if ("image" in session.user) token.picture = session.user.image;
        token.checkedAt = 0;
      }

      const id = token.id as string | undefined;
      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (id && Date.now() - checkedAt > REVALIDATE_MS) {
        const dbUser = await prisma.user.findUnique({
          where: { id },
          select: { active: true, role: true, name: true, email: true, avatarUrl: true },
        });
        token.checkedAt = Date.now();
        if (!dbUser || !dbUser.active) {
          token.active = false;
          token.error = "Inactive";
          return token;
        }
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.avatarUrl;
        token.active = true;
        delete token.error;
      }
      return token;
    },
    session({ session, token }) {
      if (token.error || token.active === false) {
        return { ...session, user: undefined as never };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.picture === "string" || token.picture === null) {
          session.user.image = token.picture as string | null;
        }
      }
      return session;
    },
  },
});
