import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";

const REVALIDATE_MS = 5 * 60_000;

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        totpVerified: { label: "2FA", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const totpVerified = credentials?.totpVerified === "1";
        if (!email || !password) return null;

        const limited = rateLimit(`login:${email.toLowerCase()}`, {
          limit: 5,
          windowMs: 15 * 60_000,
        });
        if (!limited.ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        if (user.totpEnabled && !totpVerified) return null;

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
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const email = user.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            name: user.name?.trim() || email,
            email,
            passwordHash: await hashPassword(randomBytes(32).toString("hex")),
            role: "USER",
            avatarUrl: user.image ?? null,
          },
        });
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, role: true, active: true, name: true, email: true, avatarUrl: true },
        });
        if (!dbUser?.active) return token;
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.avatarUrl;
        token.active = true;
        token.checkedAt = Date.now();
        return token;
      }

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
