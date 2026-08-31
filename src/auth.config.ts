import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/** Edge/middleware uyumlu — Prisma veya Node-only bağımlılık içermez. */
const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/giris" },
  providers: [],
  callbacks: {
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
} satisfies NextAuthConfig;

export default authConfig;
